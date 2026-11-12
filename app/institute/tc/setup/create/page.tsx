'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { 
  ArrowLeft,
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
  Printer,
  Users,
  Search,
  School,
  Save,
  HelpCircle,
  Star,
  Upload,
  Type,
  Image as ImageIcon,
  Stamp,
  User,
  QrCode,
  Feather,
  LayoutTemplate,
  MoveLeft,
  MoveRight
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  TCTemplate1, 
  TCTemplate2, 
  TCTemplate3, 
  TCTemplate4, 
  TCMiniPreview,
  TC_COLOR_PRESETS,
  TCCustomProps 
} from '@/components/tc/TCTemplates'
import { saveTCTemplate, fetchTCTemplates, TCTemplateData } from '../../actions'
import { getInstituteAddedClasses } from '@/lib/institute-classes'
import { fetchInstituteName } from '@/app/institute/actions'
import { fetchCurrentInstitutionDetails } from '@/app/institute/id-card/actions'

const TC_TITLE_PRESETS = [
  {
    title: 'Indian CBSE Official Transfer Certificate',
    subtitle: 'Official 25-point CBSE compliance format with crest, declaration & rubber seal',
    prefix: 'TC/2026/',
    startNo: '1001',
    designId: 1,
    color: '#1E3A8A'
  },
  {
    title: 'Modern Wave School Transfer Certificate',
    subtitle: 'Golden wave header, cursive script typography & spacious academic records',
    prefix: 'STC/2026/',
    startNo: '2001',
    designId: 2,
    color: '#005D5B'
  },
  {
    title: 'State Board Traditional SLC (दाखिला खारिज)',
    subtitle: 'Official Ledger Register format with Sanskrit invocation, PEN, APAAR & DIOS seal',
    prefix: 'SLC/2026/',
    startNo: '5001',
    designId: 3,
    color: '#660033'
  },
  {
    title: 'Modern Digital Smart TC (NEP 2020)',
    subtitle: 'Attested student photo frame, dynamic QR code verification & 1D barcode',
    prefix: 'DTC/2026/',
    startNo: '8001',
    designId: 4,
    color: '#0F766E'
  }
]

const TC_VISIBILITY_FIELDS = [
  'Institute Logo',
  'Candidate Photo',
  'Official Seal',
  'Verification QR Code',
  'School Address',
  'Watermark'
]

function TCSetupCreateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const paramDesign = searchParams.get('design')
  const paramColor = searchParams.get('color')

  // Top Parameters
  const [templateTitle, setTemplateTitle] = useState('Indian CBSE Official Transfer Certificate')
  const [subtitle, setSubtitle] = useState('Official Institutional Transfer & Clearance Document')
  const [prefix, setPrefix] = useState('TC/2026/')
  const [startNo, setStartNo] = useState('1001')

  // Affiliation & School Parameters
  const [affiliationBoard, setAffiliationBoard] = useState('Central Board of Secondary Education (CBSE)')
  const [schoolCode, setSchoolCode] = useState('0012')
  const [affiliationNo, setAffiliationNo] = useState('2130048')
  const [udiseCode, setUdiseCode] = useState('09123456789')
  const [schoolName, setSchoolName] = useState('COSMOPOLITAN INTER COLLEGE')
  const [schoolAddress, setSchoolAddress] = useState('Knowledge Park, Sector 62, New Delhi, India - 110001')
  const [schoolEmail, setSchoolEmail] = useState('principal@cosmopolitan.edu.in')
  const [schoolPhone, setSchoolPhone] = useState('+91 11 2659 0000')

  // Target Classes
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [classSearch, setClassSearch] = useState('')

  // Theme & Design Selection
  const [themeColor, setThemeColor] = useState<string>(paramColor || '#1E3A8A')
  const [selectedDesign, setSelectedDesign] = useState<number>(paramDesign ? Number(paramDesign) : 1)
  const [customHexInput, setCustomHexInput] = useState('#1E3A8A')

  // Signatures & Authority Configuration
  const [instPrincipalName, setInstPrincipalName] = useState('')
  const [principalName, setPrincipalName] = useState('Dr. S. K. Mukherjee')
  const [principalSignLabel, setPrincipalSignLabel] = useState('Signature of Principal')
  const [showPrincipalSign, setShowPrincipalSign] = useState(true)

  const [teacherSignLabel, setTeacherSignLabel] = useState('Class Teacher')
  const [showTeacherSign, setShowTeacherSign] = useState(true)

  const [checkedBySignLabel, setCheckedBySignLabel] = useState('Checked By')
  const [showCheckedBySign, setShowCheckedBySign] = useState(true)

  const [preparedBySignLabel, setPreparedBySignLabel] = useState('Prepared By')
  const [showPreparedBySign, setShowPreparedBySign] = useState(true)

  // Signature Sequence Ordering
  const [signatureOrder, setSignatureOrder] = useState<string[]>([
    'teacherSign',
    'checkedBySign',
    'preparedBySign',
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

  // Official Seal & Date of Issue
  const [showStamp, setShowStamp] = useState(true)
  const [sealLabel, setSealLabel] = useState('COSMOPOLITAN INTER COLLEGE')
  const [stampSize, setStampSize] = useState<number>(76)

  const [showIssueDate, setShowIssueDate] = useState(true)
  const [dateLabel, setDateLabel] = useState('Date of Issue')
  const [sampleDateOfIssue, setSampleDateOfIssue] = useState<string>('31-03-2026')

  // Signature Sizing
  const [signatureWidth, setSignatureWidth] = useState<number>(115)
  const [signatureFontSize, setSignatureFontSize] = useState<number>(10)

  // Watermark, QR, Defaults
  const [showWatermark, setShowWatermark] = useState(true)
  const [showQrCode, setShowQrCode] = useState(true)
  const [isDefault, setIsDefault] = useState(false)

  // Typography & Media Sizing Studio
  const [schoolLogo, setSchoolLogo] = useState<string>('')
  const [logoSize, setLogoSize] = useState<number>(68)
  const [showLogo, setShowLogo] = useState<boolean>(true)
  const [schoolNameFontSize, setSchoolNameFontSize] = useState<number>(24)
  const [titleFontSize, setTitleFontSize] = useState<number>(20)
  const [subtitleFontSize, setSubtitleFontSize] = useState<number>(10)
  const [bodyFontSize, setBodyFontSize] = useState<number>(10)
  const [photoSize, setPhotoSize] = useState<number>(80)
  const [showPhoto, setShowPhoto] = useState<boolean>(true)
  const [qrSize, setQrSize] = useState<number>(44)

  // Live Editable Sample Student Data for testing
  const [sampleStudentName, setSampleStudentName] = useState<string>('Aarav Sharma')
  const [sampleFatherName, setSampleFatherName] = useState<string>('Mr. Rajesh Sharma')
  const [sampleMotherName, setSampleMotherName] = useState<string>('Mrs. Sunita Sharma')
  const [sampleDob, setSampleDob] = useState<string>('15/08/2012')
  const [sampleDobWords, setSampleDobWords] = useState<string>('Fifteenth August Two Thousand Twelve')
  const [sampleClass, setSampleClass] = useState<string>('Class VII (Seventh)')
  const [sampleReason, setSampleReason] = useState<string>("Parents' Transfer / Relocation")
  const [sampleConduct, setSampleConduct] = useState<string>('Good / उत्तम')

  // Zoom & Preview States
  const [previewScale, setPreviewScale] = useState<number>(0.92)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const logoFileInputRef = useRef<HTMLInputElement | null>(null)

  // Handle Logo Upload from local machine
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      alert('Logo file must be under 3MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setSchoolLogo(result)
        setShowLogo(true)
        setToastMessage('Institute Logo uploaded successfully!')
        setTimeout(() => setToastMessage(null), 3000)
      }
    }
    reader.readAsDataURL(file)
  }

  // Load classes from master / institute
  useEffect(() => {
    try {
      const cls = getInstituteAddedClasses()
      if (cls && cls.length > 0) {
        const names = cls
          .map((c: any) => {
            if (typeof c === 'string') return c
            return c.class_name || c.className || c.name || ''
          })
          .filter(Boolean)
        const uniqueNames = Array.from(new Set(names))
        if (uniqueNames.length > 0) {
          setAvailableClasses(uniqueNames)
          setSelectedClasses(uniqueNames)
        }
      } else {
        const fallback = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
        setAvailableClasses(fallback)
        setSelectedClasses(fallback)
      }
    } catch (e) {
      const fallback = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
      setAvailableClasses(fallback)
      setSelectedClasses(fallback)
    }

    // Auto-fetch institute details
    fetchInstituteName().then(name => {
      if (name && name !== 'Name') {
        setSchoolName(name)
      }
    })

    fetchCurrentInstitutionDetails().then(res => {
      if (res?.success && res.data) {
        if (res.data.principalName) {
          setInstPrincipalName(res.data.principalName)
          setPrincipalName(prev => prev || res.data.principalName)
        }
        if (res.data.schoolName) {
          setSchoolName(prev => (prev && prev !== 'Name') ? prev : res.data.schoolName)
        }
        if (res.data.schoolAddress) {
          setSchoolAddress(prev => prev || res.data.schoolAddress)
        }
      }
    })

    // Load TC settings from /institute/tc/settings if present
    try {
      const tcSet = localStorage.getItem('school_tc_settings')
      if (tcSet) {
        const parsed = JSON.parse(tcSet)
        if (parsed.affiliationBoard) setAffiliationBoard(parsed.affiliationBoard)
        if (parsed.schoolCode) setSchoolCode(parsed.schoolCode)
      }
    } catch (e) {}
  }, [])

  // If editing an existing template, load its values
  useEffect(() => {
    if (!editId) return
    const loadExisting = async () => {
      try {
        const res = await fetchTCTemplates()
        if (res.success && Array.isArray(res.data)) {
          const matched = res.data.find((t: any) => String(t.id) === String(editId))
          if (matched) {
            setTemplateTitle(matched.title || '')
            setSubtitle(matched.subtitle || '')
            setPrefix(matched.prefix || 'TC/2026/')
            setStartNo(matched.startNo || '1001')
            setSelectedDesign(Number(matched.designId) || 1)
            setThemeColor(matched.themeColor || '#1E3A8A')
            setCustomHexInput(matched.themeColor || '#1E3A8A')
            if (Array.isArray(matched.classes)) setSelectedClasses(matched.classes)
            if (matched.affiliationBoard) setAffiliationBoard(matched.affiliationBoard)
            if (matched.schoolCode) setSchoolCode(matched.schoolCode)
            if (matched.affiliationNo) setAffiliationNo(matched.affiliationNo)
            if (matched.udiseCode) setUdiseCode(matched.udiseCode)
            if (matched.schoolName) setSchoolName(matched.schoolName)
            if (matched.schoolAddress) setSchoolAddress(matched.schoolAddress)
            if (matched.schoolEmail) setSchoolEmail(matched.schoolEmail)
            if (matched.schoolPhone) setSchoolPhone(matched.schoolPhone)

            if (matched.principalName) setPrincipalName(matched.principalName)
            if (matched.principalSignLabel) setPrincipalSignLabel(matched.principalSignLabel)
            if (matched.teacherSignLabel) setTeacherSignLabel(matched.teacherSignLabel)
            if (matched.preparedBySignLabel) setPreparedBySignLabel(matched.preparedBySignLabel)
            if (matched.checkedBySignLabel) setCheckedBySignLabel(matched.checkedBySignLabel)
            if (matched.showWatermark !== undefined) setShowWatermark(matched.showWatermark)
            if (matched.showQrCode !== undefined) setShowQrCode(matched.showQrCode)
            if (matched.isDefault !== undefined) setIsDefault(matched.isDefault)

            // Sizing Studio
            if (matched.schoolLogo) setSchoolLogo(matched.schoolLogo)
            if (matched.logoSize) setLogoSize(Number(matched.logoSize))
            if (matched.schoolNameFontSize) setSchoolNameFontSize(Number(matched.schoolNameFontSize))
            if (matched.titleFontSize) setTitleFontSize(Number(matched.titleFontSize))
            if (matched.subtitleFontSize) setSubtitleFontSize(Number(matched.subtitleFontSize))
            if (matched.bodyFontSize) setBodyFontSize(Number(matched.bodyFontSize))
            if (matched.stampSize) setStampSize(Number(matched.stampSize))
            if (matched.photoSize) setPhotoSize(Number(matched.photoSize))
            if (matched.qrSize) setQrSize(Number(matched.qrSize))
            if (matched.showLogo !== undefined) setShowLogo(matched.showLogo)
            if (matched.showPhoto !== undefined) setShowPhoto(matched.showPhoto)
            if (matched.showStamp !== undefined) setShowStamp(matched.showStamp)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadExisting()
  }, [editId])

  // Class selection helpers
  const handleToggleClass = (clsName: string) => {
    setSelectedClasses(prev => 
      prev.includes(clsName) ? prev.filter(c => c !== clsName) : [...prev, clsName]
    )
  }

  const handleToggleAllClasses = () => {
    if (selectedClasses.length === availableClasses.length) {
      setSelectedClasses([])
    } else {
      setSelectedClasses([...availableClasses])
    }
  }

  const filteredAvailableClasses = availableClasses.filter(c => 
    String(c || '').toLowerCase().includes(classSearch.toLowerCase())
  )

  // Color selection helpers
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

  // Quick Preset Selection
  const applyPreset = (preset: typeof TC_TITLE_PRESETS[0]) => {
    setTemplateTitle(preset.title)
    setSubtitle(preset.subtitle)
    setPrefix(preset.prefix)
    setStartNo(preset.startNo)
    setSelectedDesign(preset.designId)
    setThemeColor(preset.color)
    setCustomHexInput(preset.color)
    setToastMessage(`Applied ${preset.title}!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Interactive Live Canvas Two-Way Sync Handlers
  const handleCanvasUpdateField = (field: string, val: string) => {
    if (field === 'schoolName') setSchoolName(val)
    else if (field === 'schoolAddress') setSchoolAddress(val)
    else if (field === 'title') setTemplateTitle(val)
    else if (field === 'subtitle') setSubtitle(val)
    else if (field === 'studentName') setSampleStudentName(val)
    else if (field === 'fatherName') setSampleFatherName(val)
    else if (field === 'motherName') setSampleMotherName(val)
    else if (field === 'dobFigures') setSampleDob(val)
    else if (field === 'dobWords') setSampleDobWords(val)
    else if (field === 'lastClassStudied') setSampleClass(val)
    else if (field === 'reasonForLeaving') setSampleReason(val)
    else if (field === 'generalConduct') setSampleConduct(val)
    else if (field === 'dateOfIssue') setSampleDateOfIssue(val)
    else if (field === 'schoolLogo') setSchoolLogo(val)
  }

  const handleCanvasUpdateLabel = (key: string, val: string) => {
    if (key === 'principalSign') setPrincipalSignLabel(val)
    else if (key === 'teacherSign') setTeacherSignLabel(val)
    else if (key === 'checkedBySign') setCheckedBySignLabel(val)
    else if (key === 'preparedBySign') setPreparedBySignLabel(val)
  }

  // Handle Save
  const handleSave = async () => {
    if (!templateTitle.trim()) {
      alert('Please enter a Template Title.')
      return
    }
    if (selectedClasses.length === 0) {
      alert('Please select at least one applicable class.')
      return
    }

    setSaving(true)
    const payload: TCTemplateData = {
      id: editId || undefined,
      title: templateTitle.trim(),
      subtitle: subtitle.trim(),
      prefix: prefix.trim(),
      startNo: startNo.trim(),
      classes: selectedClasses,
      designId: selectedDesign,
      themeColor,
      schoolName: schoolName.trim(),
      schoolAddress: schoolAddress.trim(),
      schoolEmail: schoolEmail.trim(),
      schoolPhone: schoolPhone.trim(),
      schoolCode: schoolCode.trim(),
      affiliationBoard: affiliationBoard.trim(),
      affiliationNo: affiliationNo.trim(),
      udiseCode: udiseCode.trim(),
      schoolLogo: schoolLogo || undefined,
      principalName: principalName.trim(),
      principalSignLabel: principalSignLabel.trim(),
      teacherSignLabel: teacherSignLabel.trim(),
      preparedBySignLabel: preparedBySignLabel.trim(),
      checkedBySignLabel: checkedBySignLabel.trim(),
      showWatermark,
      showQrCode,
      isDefault,

      // Sizing Studio
      logoSize,
      schoolNameFontSize,
      titleFontSize,
      subtitleFontSize,
      bodyFontSize,
      stampSize,
      photoSize,
      qrSize,
      showLogo,
      showPhoto,
      showStamp
    }

    try {
      const res = await saveTCTemplate(payload)
      try {
        const saved = localStorage.getItem('school_tc_templates')
        let list: any[] = saved ? JSON.parse(saved) : []
        if (editId) {
          list = list.map((t: any) => String(t.id) === String(editId) ? { ...payload, id: editId } : t)
        } else {
          list.unshift({ ...payload, id: res.data?.id || Date.now() })
        }
        localStorage.setItem('school_tc_templates', JSON.stringify(list))
      } catch (e) {}

      setToastMessage('Transfer Certificate Template saved successfully to database!')
      setTimeout(() => {
        router.push('/institute/tc/setup')
      }, 900)
    } catch (err: any) {
      alert(err.message || 'Failed to save TC Template')
    } finally {
      setSaving(false)
    }
  }

  // Active Preview Props for Canvas
  const previewProps: TCCustomProps = {
    title: templateTitle || 'TRANSFER CERTIFICATE',
    subtitle: subtitle || 'Official Institutional Transfer Document',
    themeColor: themeColor || '#1E3A8A',
    schoolName,
    schoolAddress,
    schoolEmail,
    schoolPhone,
    schoolCode,
    affiliationBoard,
    affiliationNo,
    udiseCode,
    schoolLogo,
    tcNo: `${prefix}${startNo}`,
    serialNo: '408',
    admissionNo: 'ADM/2018/092',
    studentName: sampleStudentName,
    fatherName: sampleFatherName,
    motherName: sampleMotherName,
    dobFigures: sampleDob,
    dobWords: sampleDobWords,
    lastClassStudied: sampleClass,
    reasonForLeaving: sampleReason,
    generalConduct: sampleConduct,
    dateOfIssue: sampleDateOfIssue,
    principalName,
    principalSignLabel,
    teacherSignLabel,
    preparedBySignLabel,
    checkedBySignLabel,
    showWatermark,
    showQrCode,
    showLogo,
    showPhoto,
    showStamp,
    logoSize,
    schoolNameFontSize,
    titleFontSize,
    subtitleFontSize,
    bodyFontSize,
    stampSize,
    photoSize,
    qrSize,
    editable: true,
    onUpdateField: handleCanvasUpdateField,
    onUpdateLabel: handleCanvasUpdateLabel
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-24 animate-in fade-in duration-300">
      
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
          <Link
            href="/institute/tc/setup"
            className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold shadow-xs hover:bg-blue-100 transition-colors"
            title="Back to TC Setup"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>{editId ? 'Edit TC Template' : 'Configure Transfer Certificate Template'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                Setup Wizard
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Create a transfer certificate template applicable to multiple target classes with live editing &amp; theme color
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/institute/tc/setup" 
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Container */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-9">
        
        {/* ─── 1. TC NUMBERING & SERIAL SETUP ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Transfer Certificate Numbering &amp; Serial Setup
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 mb-4">
            {/* Primary Template Title Field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  <span>Transfer Certificate Title / Setup Name <span className="text-red-500">*</span></span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Updates live on certificate canvas</span>
              </div>
              <input 
                type="text" 
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="e.g. Indian CBSE Official Transfer Certificate" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-bold outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 shadow-xs" 
              />
              
              {/* Examples and Quick Presets */}
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
                    Official Transfer Certificate Presets (Click to apply):
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    1-Click Auto-Fill
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {TC_TITLE_PRESETS.map((p) => {
                    const isCurrent = templateTitle.toLowerCase() === p.title.toLowerCase()
                    return (
                      <button
                        key={p.title}
                        type="button"
                        onClick={() => applyPreset(p)}
                        title={`Click to set template to "${p.title}"`}
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
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                TC Serial Prefix (e.g. TC/2026/) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g. TC/2026/" 
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 font-mono shadow-xs" 
              />
              <span className="text-[11px] text-slate-400">Prefix will appear before every issued TC number (e.g. TC/2026/1001)</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Initial Sequence Counter Start <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={startNo}
                onChange={(e) => setStartNo(e.target.value)}
                placeholder="e.g. 1001" 
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 font-mono shadow-xs" 
              />
              <span className="text-[11px] text-slate-400">Initial sequence counter for newly generated transfer certificates</span>
            </div>
          </div>

          {/* Board Accreditation Parameters Sub-Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Affiliation Board Name</label>
              <input
                type="text"
                value={affiliationBoard}
                onChange={(e) => setAffiliationBoard(e.target.value)}
                placeholder="e.g. Central Board of Secondary Education (CBSE)"
                className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">School Code</label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="e.g. 0012"
                className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Affiliation / UDISE No.</label>
              <input
                type="text"
                value={affiliationNo}
                onChange={(e) => setAffiliationNo(e.target.value)}
                placeholder="e.g. 2130048"
                className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono outline-none focus:border-blue-500"
              />
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
            Select the classes eligible for this transfer certificate setup. All students in the selected classes can be issued this TC format.
          </p>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAllClasses}
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

        {/* ─── 3. THEME COLOR PALETTE (WHOLE CERTIFICATE STYLING) ─── */}
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
            Choose a theme color palette. Every element of the transfer certificate (borders, seals, headers, accents) transforms dynamically.
          </p>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              {TC_COLOR_PRESETS.map((preset) => {
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

        {/* ─── 4. TRANSFER CERTIFICATE DESIGN SELECTION (4 DESIGNS) ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              4
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-blue-600" />
              <span>Transfer Certificate Design Selection <span className="text-red-500">*</span></span>
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 1, name: 'Template 1: Indian CBSE Standard (Image 2)', desc: 'Official CBSE board layout with school crest, 25 numbered rows, compliance declaration & rubber stamp' },
              { id: 2, name: 'Template 2: Modern Wave Certificate (Image 1)', desc: 'Golden wave ribbon header, elegant cursive calligraphy title, clean spaced records & bottom notch' },
              { id: 3, name: 'Template 3: State Board Traditional SLC', desc: 'खाता पंजिका प्रारूप with Sanskrit invocation, S.R. Volume, PEN, APAAR & DIOS seal' },
              { id: 4, name: 'Template 4: Modern Digital Smart TC', desc: 'Attested student photo frame, dynamic QR code verification & 1D barcode' },
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
                  <div className="w-full h-44 rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <TCMiniPreview designId={item.id} themeColor={themeColor} />
                  </div>

                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 line-clamp-2">
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
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 cursor-pointer"
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
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                onClick={() => setPreviewScale(0.92)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ─── CERTIFICATE MEDIA & SIZING STUDIO ─── */}
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
                    Certificate Media &amp; Sizing Studio
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
                    setLogoSize(68)
                    setPhotoSize(80)
                    setQrSize(44)
                    setStampSize(76)
                    setSignatureWidth(115)
                    setSignatureFontSize(10)
                    setShowLogo(true)
                    setShowPhoto(true)
                    setShowStamp(true)
                    setShowQrCode(true)
                    setToastMessage('Reset all media & element sizes to standard defaults')
                    setTimeout(() => setToastMessage(null), 3000)
                  }}
                  className="text-[10.5px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
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
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition-all shadow-2xs cursor-pointer ${
                        showLogo
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {showLogo ? '● Visible' : '○ Hidden'}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                    {logoSize} px
                  </span>
                </div>

                {/* Upload & Sample Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
                      className="py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 shadow-2xs cursor-pointer"
                    >
                      Sample
                    </button>
                  )}
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  {[
                    { label: 'S (48px)', size: 48 },
                    { label: 'M (60px)', size: 60 },
                    { label: 'L (76px)', size: 76 },
                    { label: 'XL (96px)', size: 96 }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setLogoSize(p.size)}
                      className={`py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        logoSize === p.size
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
                      value={logoSize}
                      onChange={e => setLogoSize(Number(e.target.value))}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-9 text-right text-[10.5px]">{logoSize}px</span>
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
                      onClick={() => setShowPhoto(prev => !prev)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition-all shadow-2xs cursor-pointer ${
                        showPhoto
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {showPhoto ? '● Visible' : '○ Hidden'}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                    {photoSize} × {Math.round(photoSize * 1.25)} px
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  {[
                    { label: 'S (50px)', size: 50 },
                    { label: 'M (68px)', size: 68 },
                    { label: 'L (80px)', size: 80 },
                    { label: 'XL (95px)', size: 95 }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPhotoSize(p.size)}
                      className={`py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        photoSize === p.size
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
                      max="110"
                      step="2"
                      value={photoSize}
                      onChange={e => setPhotoSize(Number(e.target.value))}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-9 text-right text-[10.5px]">{photoSize}px</span>
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
                      onClick={() => setShowQrCode(prev => !prev)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition-all shadow-2xs cursor-pointer ${
                        showQrCode
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {showQrCode ? '● Visible' : '○ Hidden'}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                    {qrSize} px
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  {[
                    { label: 'S (36px)', size: 36 },
                    { label: 'M (44px)', size: 44 },
                    { label: 'L (56px)', size: 56 },
                    { label: 'XL (68px)', size: 68 }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setQrSize(p.size)}
                      className={`py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        qrSize === p.size
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
                      min="30"
                      max="90"
                      step="2"
                      value={qrSize}
                      onChange={e => setQrSize(Number(e.target.value))}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-9 text-right text-[10.5px]">{qrSize}px</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 pt-0.5">
                    Crisp scan verification matrix.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ─── QUICK TYPOGRAPHY & FONT SIZING CONTROLS ─── */}
          <div className="border border-slate-200/90 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-850 p-4 shadow-xs space-y-3 mb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Quick Typography &amp; Font Sizing Controls
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold">
                  Customize institute name, certificate title, and subtitle font sizes in real time
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSchoolNameFontSize(24)
                    setTitleFontSize(20)
                    setSubtitleFontSize(10)
                    setBodyFontSize(10)
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline ml-2 cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                    onClick={() => setSchoolNameFontSize(prev => Math.max(10, prev - 1))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="10"
                    max="36"
                    step="1"
                    value={schoolNameFontSize}
                    onChange={e => setSchoolNameFontSize(Number(e.target.value))}
                    className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    title="Make Institute Name bigger"
                    onClick={() => setSchoolNameFontSize(prev => Math.min(36, prev + 1))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
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
                    onClick={() => setTitleFontSize(prev => Math.max(14, prev - 1))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="14"
                    max="36"
                    step="1"
                    value={titleFontSize}
                    onChange={e => setTitleFontSize(Number(e.target.value))}
                    className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    title="Make Certificate Title bigger"
                    onClick={() => setTitleFontSize(prev => Math.min(36, prev + 1))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* 3. Subtitle / Tagline Font Size */}
              <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-[10.5px]">Subtitle / Tagline:</span>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[10.5px] bg-blue-50 dark:bg-blue-950/60 px-1 rounded">{subtitleFontSize}px</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Make Subtitle smaller"
                    onClick={() => setSubtitleFontSize(prev => Math.max(8, prev - 1))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="8"
                    max="20"
                    step="1"
                    value={subtitleFontSize}
                    onChange={e => setSubtitleFontSize(Number(e.target.value))}
                    className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    title="Make Subtitle bigger"
                    onClick={() => setSubtitleFontSize(prev => Math.min(20, prev + 1))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* 4. Body / Record Fields Font Size */}
              <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-[10.5px]">Body / Record Fields:</span>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[10.5px] bg-blue-50 dark:bg-blue-950/60 px-1 rounded">{bodyFontSize}px</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Make Body text smaller"
                    onClick={() => setBodyFontSize(prev => Math.max(8, prev - 1))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="8"
                    max="18"
                    step="1"
                    value={bodyFontSize}
                    onChange={e => setBodyFontSize(Number(e.target.value))}
                    className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    title="Make Body text bigger"
                    onClick={() => setBodyFontSize(prev => Math.min(18, prev + 1))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
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
              {selectedDesign === 1 && <TCTemplate1 {...previewProps} />}
              {selectedDesign === 2 && <TCTemplate2 {...previewProps} />}
              {selectedDesign === 3 && <TCTemplate3 {...previewProps} />}
              {selectedDesign === 4 && <TCTemplate4 {...previewProps} />}
            </div>
          </div>
        </section>

        {/* ─── 6. TRANSFER CERTIFICATE DETAILS & STUDENT RECORDS ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              6
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Transfer Certificate Details &amp; Sample Student Records</span>
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          <div className="space-y-5 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Sample Student Name</label>
                <input
                  type="text"
                  value={sampleStudentName}
                  onChange={e => setSampleStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Father&apos;s Name</label>
                <input
                  type="text"
                  value={sampleFatherName}
                  onChange={e => setSampleFatherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mother&apos;s Name</label>
                <input
                  type="text"
                  value={sampleMotherName}
                  onChange={e => setSampleMotherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth (Figures)</label>
                <input
                  type="text"
                  value={sampleDob}
                  onChange={e => setSampleDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth (In Words)</label>
                <input
                  type="text"
                  value={sampleDobWords}
                  onChange={e => setSampleDobWords(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Class Last Studied</label>
                <input
                  type="text"
                  value={sampleClass}
                  onChange={e => setSampleClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason for Leaving School</label>
                <input
                  type="text"
                  value={sampleReason}
                  onChange={e => setSampleReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">General Conduct</label>
                <input
                  type="text"
                  value={sampleConduct}
                  onChange={e => setSampleConduct(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>

            {/* School Profile Details */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">School Contact Details (Printed in Header):</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">School Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">School Address</label>
                  <input
                    type="text"
                    value={schoolAddress}
                    onChange={e => setSchoolAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. SIGNATURES & STAMP CONFIGURATION (SEPARATE SECTION) ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                7
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Feather className="w-4 h-4 text-blue-600" />
                  <span>Signatures &amp; Credentials Authority Hub</span>
                </h2>
                <p className="text-[11px] text-slate-500 font-normal">
                  Configure signatures, reposition order using Left/Right controls, and customize designations.
                </p>
              </div>
            </div>
          </div>

          {/* Live Print Sequence Ribbon Indicator */}
          <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto">
            <span className="text-[10px] font-black uppercase text-slate-400 px-2 shrink-0">Print Sequence:</span>
            {signatureOrder.map((key, idx) => {
              let isEnabled = false
              let label = ''
              if (key === 'teacherSign') { isEnabled = showTeacherSign; label = "Class Teacher" }
              else if (key === 'checkedBySign') { isEnabled = showCheckedBySign; label = "Checked By" }
              else if (key === 'preparedBySign') { isEnabled = showPreparedBySign; label = "Prepared By" }
              else if (key === 'principalSign') { isEnabled = showPrincipalSign; label = "Principal Sign" }

              return (
                <React.Fragment key={key}>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10.5px] font-bold shrink-0 transition-all border ${
                    isEnabled 
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' 
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                  }`}>
                    <span className="text-[10.5px] font-black">{idx + 1}</span>
                    <span>{label}</span>
                  </div>
                  {idx < signatureOrder.length - 1 && (
                    <span className="text-slate-300 dark:text-slate-600 text-xs shrink-0">→</span>
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Signature Sizing Controls (Width & Typography) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Signature Line Width */}
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Signature Line Width</span>
                <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                  {signatureWidth} px
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700">
                {[
                  { label: 'S (75px)', size: 75 },
                  { label: 'M (100px)', size: 100 },
                  { label: 'L (130px)', size: 130 },
                  { label: 'XL (165px)', size: 165 }
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setSignatureWidth(p.size)}
                    className={`py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      signatureWidth === p.size
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
                    value={signatureWidth}
                    onChange={e => setSignatureWidth(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{signatureWidth}px</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Adjusts width of teacher, checked by, prepared by, and principal sign lines.</p>
              </div>
            </div>

            {/* Signature Font Size */}
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Signature Title Font Size</span>
                <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                  {signatureFontSize} px
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700">
                {[
                  { label: 'S (8px)', size: 8 },
                  { label: 'M (10px)', size: 10 },
                  { label: 'L (12px)', size: 12 },
                  { label: 'XL (14px)', size: 14 }
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setSignatureFontSize(p.size)}
                    className={`py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      signatureFontSize === p.size
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
                    value={signatureFontSize}
                    onChange={e => setSignatureFontSize(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{signatureFontSize}px</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                  <p className="text-[10px] text-slate-400">Controls signature label typography.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureWidth(115)
                      setSignatureFontSize(10)
                    }}
                    className="text-[9.5px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
                  >
                    Default Size
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Primary Signatures Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {signatureOrder.map((key, idx) => {
              const isFirst = idx === 0
              const isLast = idx === signatureOrder.length - 1

              if (key === 'teacherSign') {
                return (
                  <div 
                    key={key} 
                    className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                      showTeacherSign 
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
                            showTeacherSign 
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {showTeacherSign ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowTeacherSign(!showTeacherSign)}
                          className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${showTeacherSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showTeacherSign ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                        <input
                          type="text"
                          value={teacherSignLabel}
                          onChange={e => setTeacherSignLabel(e.target.value)}
                          disabled={!showTeacherSign}
                          placeholder="Class Teacher"
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
                          onClick={() => handleMoveSignature(key, 'left')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                          title="Move Left"
                        >
                          <MoveLeft className="w-3 h-3" /> Move Left
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveSignature(key, 'right')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                          title="Move Right"
                        >
                          Move Right <MoveRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              if (key === 'checkedBySign') {
                return (
                  <div 
                    key={key} 
                    className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                      showCheckedBySign 
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
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100">Checked By Sign</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            showCheckedBySign 
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {showCheckedBySign ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCheckedBySign(!showCheckedBySign)}
                          className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${showCheckedBySign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showCheckedBySign ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                        <input
                          type="text"
                          value={checkedBySignLabel}
                          onChange={e => setCheckedBySignLabel(e.target.value)}
                          disabled={!showCheckedBySign}
                          placeholder="Checked By"
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
                          onClick={() => handleMoveSignature(key, 'left')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                          title="Move Left"
                        >
                          <MoveLeft className="w-3 h-3" /> Move Left
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveSignature(key, 'right')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                          title="Move Right"
                        >
                          Move Right <MoveRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              if (key === 'preparedBySign') {
                return (
                  <div 
                    key={key} 
                    className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                      showPreparedBySign 
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
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100">Prepared By Sign</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            showPreparedBySign 
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {showPreparedBySign ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPreparedBySign(!showPreparedBySign)}
                          className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${showPreparedBySign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showPreparedBySign ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                        <input
                          type="text"
                          value={preparedBySignLabel}
                          onChange={e => setPreparedBySignLabel(e.target.value)}
                          disabled={!showPreparedBySign}
                          placeholder="Prepared By"
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
                          onClick={() => handleMoveSignature(key, 'left')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                          title="Move Left"
                        >
                          <MoveLeft className="w-3 h-3" /> Move Left
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveSignature(key, 'right')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                          title="Move Right"
                        >
                          Move Right <MoveRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              if (key === 'principalSign') {
                return (
                  <div 
                    key={key} 
                    className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                      showPrincipalSign 
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
                            showPrincipalSign 
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {showPrincipalSign ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPrincipalSign(!showPrincipalSign)}
                          className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${showPrincipalSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showPrincipalSign ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>

                      {/* Auto-fetch Institute Detail Pill */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-[10.5px] text-blue-800 dark:text-blue-200 mb-2.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <div className="truncate">
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Auto-fetched from Institute:</span>
                          <span className="font-extrabold capitalize text-blue-700 dark:text-blue-300">{instPrincipalName || principalName || 'Principal'}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                          {(instPrincipalName || principalName) && (
                            <button
                              type="button"
                              onClick={() => {
                                const name = instPrincipalName || principalName
                                setPrincipalSignLabel(`Signature of Principal (${name})`)
                              }}
                              className="text-[9px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                            >
                              + Add Name
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={principalSignLabel}
                          onChange={e => setPrincipalSignLabel(e.target.value)}
                          disabled={!showPrincipalSign}
                          placeholder="Signature of Principal"
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
                          onClick={() => handleMoveSignature(key, 'left')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                          title="Move Left"
                        >
                          <MoveLeft className="w-3 h-3" /> Move Left
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveSignature(key, 'right')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
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

          {/* Certificate Credentials & Verification Seals Sub-Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Official Rubber Seal / Stamp */}
            <div className={`p-4 rounded-2xl border transition-all ${
              showStamp 
                ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
            }`}>
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">Official Rubber Stamp / Seal</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    showStamp 
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {showStamp ? 'ON' : 'OFF'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStamp(!showStamp)}
                  className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${showStamp ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showStamp ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Seal Crest Text</label>
                  <input
                    type="text"
                    value={sealLabel}
                    onChange={e => setSealLabel(e.target.value)}
                    disabled={!showStamp}
                    placeholder="COSMOPOLITAN INTER COLLEGE"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs uppercase"
                  />
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">Official Seal Diameter:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded text-[10px]">
                      {stampSize} px
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    {[
                      { label: 'S (56px)', size: 56 },
                      { label: 'M (68px)', size: 68 },
                      { label: 'L (76px)', size: 76 },
                      { label: 'XL (88px)', size: 88 }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setStampSize(p.size)}
                        className={`py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          stampSize === p.size
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {p.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="range"
                      min="48"
                      max="100"
                      step="2"
                      value={stampSize}
                      onChange={e => setStampSize(Number(e.target.value))}
                      disabled={!showStamp}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40 text-[10px] text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span>Vector 300 DPI Institutional Rubber Seal with themed circular border</span>
                </div>
              </div>
            </div>

            {/* Date of Issue */}
            <div className={`p-4 rounded-2xl border transition-all ${
              showIssueDate 
                ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
            }`}>
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">Date of Issue</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    showIssueDate 
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {showIssueDate ? 'ON' : 'OFF'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIssueDate(!showIssueDate)}
                  className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${showIssueDate ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showIssueDate ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date Footer Title</label>
                  <input
                    type="text"
                    value={dateLabel}
                    onChange={e => setDateLabel(e.target.value)}
                    disabled={!showIssueDate}
                    placeholder="Date of Issue"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Transfer Certificate Issue Date</label>
                  <input
                    type="text"
                    value={sampleDateOfIssue}
                    onChange={e => setSampleDateOfIssue(e.target.value)}
                    disabled={!showIssueDate}
                    placeholder="e.g. 31-03-2026"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                  />
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
                <span>Certificate Fields Visibility &amp; Display Options</span>
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* 1. Logo */}
            <label className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none text-xs transition-all ${
              showLogo 
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 font-bold shadow-2xs ring-1 ring-blue-400/20' 
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={e => setShowLogo(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 cursor-pointer"
                />
                <span className="truncate">Institute Logo</span>
              </div>
              {showLogo && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3] shrink-0" />}
            </label>

            {/* 2. Photo */}
            <label className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none text-xs transition-all ${
              showPhoto 
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 font-bold shadow-2xs ring-1 ring-blue-400/20' 
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={showPhoto}
                  onChange={e => setShowPhoto(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 cursor-pointer"
                />
                <span className="truncate">Candidate Photo</span>
              </div>
              {showPhoto && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3] shrink-0" />}
            </label>

            {/* 3. Rubber Stamp */}
            <label className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none text-xs transition-all ${
              showStamp 
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 font-bold shadow-2xs ring-1 ring-blue-400/20' 
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={showStamp}
                  onChange={e => setShowStamp(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 cursor-pointer"
                />
                <span className="truncate">Rubber Stamp</span>
              </div>
              {showStamp && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3] shrink-0" />}
            </label>

            {/* 4. QR Code */}
            <label className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none text-xs transition-all ${
              showQrCode 
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 font-bold shadow-2xs ring-1 ring-blue-400/20' 
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={showQrCode}
                  onChange={e => setShowQrCode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 cursor-pointer"
                />
                <span className="truncate">Verification QR</span>
              </div>
              {showQrCode && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3] shrink-0" />}
            </label>

            {/* 5. Watermark */}
            <label className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none text-xs transition-all ${
              showWatermark 
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 font-bold shadow-2xs ring-1 ring-blue-400/20' 
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={e => setShowWatermark(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 cursor-pointer"
                />
                <span className="truncate">Watermark</span>
              </div>
              {showWatermark && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3] shrink-0" />}
            </label>

            {/* 6. Default Template Pill */}
            <label className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none text-xs transition-all ${
              isDefault 
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 font-bold shadow-2xs ring-1 ring-blue-400/20' 
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={e => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 cursor-pointer"
                />
                <span className="truncate">Default TC</span>
              </div>
              {isDefault && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3] shrink-0" />}
            </label>
          </div>
        </section>

      </div>

    </div>
  )
}

export default function TCSetupCreatePage() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center text-xs font-bold text-slate-400">
        Loading TC Template Creator...
      </div>
    }>
      <TCSetupCreateContent />
    </Suspense>
  )
}

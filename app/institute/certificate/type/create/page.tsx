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
  LayoutTemplate
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
  'Principal Sign', 'QR Code'
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
  const [issueDate, setIssueDate] = useState('15 October 2025')
  const [content, setContent] = useState(
    'This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session.'
  )

  // Signatures & Labels
  const [principalName, setPrincipalName] = useState('Dr. S. K. Sharma')
  const [principalLabel, setPrincipalLabel] = useState('Principal & Director')
  const [showPrincipalSign, setShowPrincipalSign] = useState(true)
  const [showSeal, setShowSeal] = useState(true)
  const [showQr, setShowQr] = useState(true)

  // Visibility / Hidden Fields
  const [hiddenFields, setHiddenFields] = useState<string[]>([])

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
          if (Array.isArray(found.hiddenFields)) setHiddenFields(found.hiddenFields)
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

  // Hidden fields toggles
  const handleToggleHiddenField = (field: string) => {
    if (hiddenFields.includes(field)) {
      setHiddenFields(hiddenFields.filter(f => f !== field))
    } else {
      setHiddenFields([...hiddenFields, field])
    }
  }

  const handleSelectAllHidden = () => {
    if (hiddenFields.length === HIDDEN_FIELDS_LIST.length) {
      setHiddenFields([])
    } else {
      setHiddenFields([...HIDDEN_FIELDS_LIST])
    }
  }

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
  }

  const handleCanvasUpdateLabel = (key: string, val: string) => {
    if (key === 'principalSign') setPrincipalLabel(val)
  }

  // Save Certificate Type
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const effHidden = [...hiddenFields]
      if (!showPrincipalSign && !effHidden.includes('Principal Sign')) effHidden.push('Principal Sign')
      if (!showSeal && !effHidden.includes('Water Mark')) effHidden.push('Water Mark')
      if (!showQr && !effHidden.includes('QR Code')) effHidden.push('QR Code')

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
        hiddenFields: effHidden
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
                  themeColor={themeColor}
                  showQr={showQr}
                  showSeal={showSeal}
                  hiddenFields={hiddenFields} 
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
                  themeColor={themeColor}
                  showSeal={showSeal}
                  hiddenFields={hiddenFields} 
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
                  themeColor={themeColor}
                  showQr={showQr}
                  hiddenFields={hiddenFields} 
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
                  themeColor={themeColor}
                  showQr={showQr}
                  showSeal={showSeal}
                  hiddenFields={hiddenFields} 
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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              7
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Feather className="w-4 h-4 text-teal-600" />
              <span>Signature & Stamp Configuration</span>
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* Principal / Authorized Sign */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Primary Authorized Signatory
              </h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Signatory Full Name</label>
                <input 
                  type="text" 
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500 shadow-xs" 
                  placeholder="e.g. Dr. S. K. Sharma"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Signatory Designation / Label</label>
                <input 
                  type="text" 
                  value={principalLabel}
                  onChange={(e) => setPrincipalLabel(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500 shadow-xs" 
                  placeholder="e.g. Principal & Director"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                <input 
                  type="checkbox"
                  checked={showPrincipalSign}
                  onChange={(e) => setShowPrincipalSign(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Show Principal Signature Area</span>
              </label>
            </div>

            {/* Official Seal & Credentials */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Official Seals, QR Code & Date
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Issue Date (Preview Sample)</label>
                <input 
                  type="text" 
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500 shadow-xs" 
                  placeholder="e.g. 15 October 2025"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={showSeal}
                    onChange={(e) => setShowSeal(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Display Golden Official Seal / Stamp</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={showQr}
                    onChange={(e) => setShowQr(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Display Verified Security QR Code</span>
                </label>
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
              onClick={handleSelectAllHidden}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs"
            >
              {hiddenFields.length === HIDDEN_FIELDS_LIST.length ? 'Show All Fields' : 'Hide All Fields'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            {HIDDEN_FIELDS_LIST.map((field) => {
              const isHidden = hiddenFields.includes(field)

              return (
                <label 
                  key={field} 
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none text-xs transition-all ${
                    isHidden 
                      ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 text-red-600 line-through' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isHidden}
                    onChange={() => handleToggleHiddenField(field)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span className="font-bold">
                    {isHidden ? `Hide ${field}` : `Show ${field}`}
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

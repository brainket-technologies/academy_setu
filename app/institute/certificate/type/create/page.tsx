'use client'

import React, { useState, useEffect } from 'react'
import { X, Check, Award, Sparkles, CheckSquare, Square, ChevronDown, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  CertificateDesign1, 
  CertificateDesign2, 
  CertificateDesign3, 
  CertificateDesign4 
} from '@/components/certificates/CertificateTemplates'
import { saveCertificateType } from '../../actions'

const DEFAULT_CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11 - Science', 'Class 11 - Commerce', 'Class 12 - Science', 'Class 12 - Commerce'
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

export default function AddCertificateTypePage() {
  const router = useRouter()

  // Top Settings
  const [prefix, setPrefix] = useState('CER/2025/')
  const [startNo, setStartNo] = useState('101')

  // Multiple Added Classes Selection
  const [availableClasses, setAvailableClasses] = useState<string[]>(DEFAULT_CLASSES)
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['Class 8', 'Class 9', 'Class 10'])
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false)
  const [classSearch, setClassSearch] = useState('')

  // Certificate Title & Design
  const [title, setTitle] = useState('Certificate of Achievement')
  const [subtitle, setSubtitle] = useState('In Recognition of Academic Excellence')
  const [selectedDesign, setSelectedDesign] = useState<number>(1)
  const [titleBgColor, setTitleBgColor] = useState('#1e3a8a')
  const [textColor, setTextColor] = useState('#0f172a')
  const [fontSize, setFontSize] = useState('14')

  // Certificate Body Content
  const [content, setContent] = useState(
    'This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session.'
  )

  // Hidden Fields
  const hiddenFieldsList = [
    'Title', 'School Name', 'Tagline', 'School Address',
    'Affiliated To', 'Affiliated Code', 'School Code', 'UDISE Code',
    'Website', 'School Logo', 'Phone No.', 'Water Mark',
    'Registration No.', 'Admission No.', 'Session',
    'Student Photo', 'Certificate Date', 'Principal Sign', 'QR Code'
  ]
  const [hiddenFields, setHiddenFields] = useState<string[]>([])

  // Load added classes from localStorage or masters
  useEffect(() => {
    try {
      const saved = localStorage.getItem('school_masters_classes')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const names = parsed.map((c: any) => c.className || c.name).filter(Boolean)
          const merged = Array.from(new Set([...names, ...DEFAULT_CLASSES]))
          setAvailableClasses(merged)
        }
      }
    } catch (e) {}
  }, [])

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

  // Hidden field toggle
  const handleToggleHiddenField = (field: string) => {
    if (hiddenFields.includes(field)) {
      setHiddenFields(hiddenFields.filter(f => f !== field))
    } else {
      setHiddenFields([...hiddenFields, field])
    }
  }

  const handleSelectAllHidden = () => {
    if (hiddenFields.length === hiddenFieldsList.length) {
      setHiddenFields([])
    } else {
      setHiddenFields([...hiddenFieldsList])
    }
  }

  // Insert merge tag into content
  const handleInsertTag = (tag: string) => {
    setContent(prev => `${prev} ${tag}`)
  }

  // Save Certificate Type to PostgreSQL
  const handleSave = async () => {
    try {
      await saveCertificateType({
        title: title || 'Certificate of Achievement',
        subtitle,
        prefix,
        startNo,
        classes: selectedClasses,
        designId: selectedDesign,
        content,
        titleBgColor,
        textColor,
        fontSize,
        hiddenFields
      })
    } catch (e) {
      console.error(e)
    }

    router.push('/institute/certificate/type?saved=true')
  }

  const filteredAvailableClasses = availableClasses.filter(c => 
    c.toLowerCase().includes(classSearch.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Configure Certificate Type</h1>
            <p className="text-xs text-slate-500 font-medium">Create a certificate template setup applicable to multiple target classes</p>
          </div>
        </div>

        <Link 
          href="/institute/certificate/type" 
          className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-8">
        
        {/* 1. Certificate Numbering Settings */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              1. Certificate Numbering & Serial Setup
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Certificate Serial Prefix <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g. CER/2025/" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200 font-mono" 
              />
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
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200 font-mono" 
              />
            </div>
          </div>
        </section>

        {/* 2. Target Applicable Classes (Multiple Added Classes - NO STUDENT FIELD) */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 w-full">
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                2. Applicable Classes (Select Multiple Added Classes) <span className="text-red-500">*</span>
              </h2>
              <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            Select the classes eligible for this certificate type. All students in the selected classes can be issued this certificate.
          </p>

          {/* Quick Select & Class Pills */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllClasses}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1.5"
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
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 w-44"
              />
            </div>

            {/* Checkbox Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
              {filteredAvailableClasses.map((cls) => {
                const isSelected = selectedClasses.includes(cls)

                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleToggleClass(cls)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border text-left flex items-center justify-between transition-all ${
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

            {/* Selected Tags Display */}
            {selectedClasses.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Active Classes:</span>
                {selectedClasses.map(cls => (
                  <span 
                    key={cls}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-100/70 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 rounded-md text-[11px] font-semibold"
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

        {/* 3. Certificate Title & Design */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              3. Certificate Title & Specialized Design <span className="text-red-500">*</span>
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
          </div>
          
          {/* Certificate Title with suggestions */}
          <div className="flex flex-col gap-2 mb-6">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Certificate Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Certificate of Achievement" 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:border-teal-500 transition-all text-slate-800 dark:text-slate-100" 
            />
            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[10px] font-semibold text-slate-400">Suggestions:</span>
              {TITLE_SUGGESTIONS.map(sug => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTitle(sug)}
                  className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 font-medium transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Certificate Design Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { id: 1, name: 'Design 1: Royal Blue & Gold', desc: 'Geometric corners with gold ribbons' },
              { id: 2, name: 'Design 2: Ornate Vintage Gold', desc: 'Classic filigree & heritage seal' },
              { id: 3, name: 'Design 3: Modern Emerald & Gold', desc: 'Luxury sports & achievement wreath' },
              { id: 4, name: 'Design 4: Academic Blue Frame', desc: 'Formal curriculum completion border' },
            ].map(item => {
              const isSelected = selectedDesign === item.id

              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedDesign(item.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 shadow-md ring-2 ring-teal-500/20 scale-[1.02]' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  {/* Thumbnail Representation */}
                  <div className="w-full h-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-2 shadow-xs">
                    {item.id === 1 && (
                      <div className="w-full h-full relative border border-blue-200 flex flex-col items-center justify-center bg-white">
                        <div className="absolute top-0 left-0 w-6 h-6 bg-blue-700 -rotate-45 -translate-x-3 -translate-y-3"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-700 -rotate-45 translate-x-3 translate-y-3"></div>
                        <div className="text-[7px] font-black text-blue-900 uppercase">CERTIFICATE</div>
                        <div className="w-8 h-0.5 bg-amber-400 mt-0.5"></div>
                      </div>
                    )}
                    {item.id === 2 && (
                      <div className="w-full h-full border border-amber-300 bg-amber-50/60 flex flex-col items-center justify-center p-1">
                        <div className="text-[7px] font-serif font-black text-amber-900">CERTIFICATE</div>
                        <div className="text-[5px] text-amber-700 italic">Of Merit</div>
                        <div className="w-6 h-0.5 bg-amber-400 mt-0.5"></div>
                      </div>
                    )}
                    {item.id === 3 && (
                      <div className="w-full h-full border-2 border-emerald-700 bg-emerald-50/40 flex flex-col items-center justify-center p-1">
                        <div className="text-[7px] font-black text-emerald-900">EXCELLENCE</div>
                        <div className="w-6 h-0.5 bg-emerald-600 mt-0.5"></div>
                      </div>
                    )}
                    {item.id === 4 && (
                      <div className="w-full h-full border-2 border-slate-800 bg-white flex flex-col items-center justify-center p-1">
                        <div className="text-[7px] font-black text-slate-900">COMPLETION</div>
                        <div className="w-8 h-0.5 bg-blue-500 mt-0.5"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 w-full justify-center">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">
                      {item.name}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Customization & Live Certificate Preview */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Color & Size Controls */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Title Accent Color</label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={titleBgColor}
                    onChange={(e) => setTitleBgColor(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:border-teal-500" 
                  />
                  <div className="absolute right-2 w-5 h-5 rounded border border-slate-300" style={{ backgroundColor: titleBgColor }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Body Text Color</label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:border-teal-500" 
                  />
                  <div className="absolute right-2 w-5 h-5 rounded border border-slate-300" style={{ backgroundColor: textColor }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Title Font Size (px)</label>
                <input 
                  type="number" 
                  defaultValue="24" 
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs outline-none focus:border-teal-500" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subtitle Tagline</label>
                <input 
                  type="text" 
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs outline-none focus:border-teal-500" 
                />
              </div>
            </div>

            {/* Live Interactive Certificate Preview */}
            <div className="w-full lg:w-[480px] shrink-0 flex flex-col items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Live Certificate Preview
                </span>
                <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-bold">
                  Design {selectedDesign}
                </span>
              </div>

              <div className="w-full min-h-[320px] bg-slate-200/50 dark:bg-slate-800/50 rounded-xl p-2 flex items-center justify-center overflow-hidden border border-slate-200">
                <div style={{ transform: 'scale(0.48)', transformOrigin: 'center' }} className="flex items-center justify-center">
                  {selectedDesign === 1 && (
                    <CertificateDesign1 
                      title={title} 
                      subtitle={subtitle} 
                      content={content} 
                      hiddenFields={hiddenFields} 
                    />
                  )}
                  {selectedDesign === 2 && (
                    <CertificateDesign2 
                      title={title} 
                      subtitle={subtitle} 
                      content={content} 
                      hiddenFields={hiddenFields} 
                    />
                  )}
                  {selectedDesign === 3 && (
                    <CertificateDesign3 
                      title={title} 
                      subtitle={subtitle} 
                      content={content} 
                      hiddenFields={hiddenFields} 
                    />
                  )}
                  {selectedDesign === 4 && (
                    <CertificateDesign4 
                      title={title} 
                      subtitle={subtitle} 
                      content={content} 
                      hiddenFields={hiddenFields} 
                    />
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-medium text-center">
                High-Resolution Printable Certificate • Standard A4 / Letter Landscape
              </p>
            </div>
          </div>
        </section>

        {/* 4. Certificate Content & Template Variables */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              4. Certificate Body Text & Placeholders
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            {/* Merge Tags Quick Bar */}
            <div className="flex items-center gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex-wrap text-xs">
              <span className="text-[11px] font-bold text-slate-500 mr-1">Insert Dynamic Tag:</span>
              {[
                '{Student Name}', '{Father Name}', '{Class}', '{Roll No}', 
                '{Admission No}', '{Academic Session}', '{Date}', '{Achievement Detail}'
              ].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-teal-700 dark:text-teal-300 font-bold hover:bg-teal-50 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea 
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 text-xs text-slate-700 dark:text-slate-200 outline-none resize-none leading-relaxed bg-transparent"
              placeholder="Enter the certificate narrative text..."
            ></textarea>
          </div>
        </section>

        {/* 5. Select the fields to be hidden */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              5. Certificate Fields Visibility & Options
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
            
            <button
              type="button"
              onClick={handleSelectAllHidden}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 transition-colors"
            >
              {hiddenFields.length === hiddenFieldsList.length ? 'Show All' : 'Hide All'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            {hiddenFieldsList.map((field) => {
              const isHidden = hiddenFields.includes(field)

              return (
                <label 
                  key={field} 
                  className="flex items-center gap-2.5 cursor-pointer group select-none text-xs"
                >
                  <input
                    type="checkbox"
                    checked={isHidden}
                    onChange={() => handleToggleHiddenField(field)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span className={`font-medium ${isHidden ? 'text-red-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                    Hide {field}
                  </span>
                </label>
              )
            })}
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link 
            href="/institute/certificate/type" 
            className="px-8 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm"
          >
            Cancel
          </Link>
          <button 
            type="button"
            onClick={handleSave}
            className="px-10 py-2.5 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-md text-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Save Certificate Type
          </button>
        </div>

      </div>
    </div>
  )
}

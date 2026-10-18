'use client'

import React, { useState, Suspense } from 'react'
import { X, Check, Eye, RotateCw, Sparkles, Palette } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  StudentDesignVertical, 
  StudentDesignHorizontal, 
  TeacherDesignVertical, 
  TeacherDesignHorizontal, 
  EmployeeDesignVertical, 
  EmployeeDesignHorizontal,
  IdCardBackDesign,
  ID_CARD_COLOR_PRESETS
} from '@/components/id-cards/IdCardTemplates'
import { saveIdCardSetup } from '../../actions'

function GenerateIdCardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialRole = searchParams.get('for') || 'Student'
  const initialDesignParam = Number(searchParams.get('design')) || 1
  const initialDesign = [1, 2, 3, 4].includes(initialDesignParam) ? initialDesignParam : 1

  const [role, setRole] = useState<'Student' | 'Teacher' | 'Employee'>(
    initialRole === 'Teacher' ? 'Teacher' : initialRole === 'Employee' ? 'Employee' : 'Student'
  )
  const [selectedDesign, setSelectedDesign] = useState<number>(initialDesign)
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front')

  const initialColor = searchParams.get('color') || '#0284c7'
  const [themeColor, setThemeColor] = useState<string>(initialColor)
  const [principalName, setPrincipalName] = useState('K.Singhal')
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({})

  // Form Fields
  const [title, setTitle] = useState(
    role === 'Student' ? 'STUDENT IDENTITY CARD' : role === 'Teacher' ? 'FACULTY IDENTITY CARD' : 'STAFF IDENTITY CARD'
  )
  const [tagline, setTagline] = useState('Affiliated to CBSE, New Delhi')
  const [session, setSession] = useState('2025-26')
  const [schoolName, setSchoolName] = useState('COSMOPOLITAN INTER COLLEGE')
  const [schoolAddress, setSchoolAddress] = useState('Knowledge Park, Sector 62, New Delhi')
  const [udiseCode, setUdiseCode] = useState('09120401882')
  const [schoolCode, setSchoolCode] = useState('SCH-8841')
  const [affiliatedTo, setAffiliatedTo] = useState('CBSE, New Delhi')
  const [affiliationCode, setAffiliationCode] = useState('CBSE-213089')
  const [schoolPhone, setSchoolPhone] = useState('+91 11 2345 6789')
  const [schoolEmail, setSchoolEmail] = useState('info@academy.edu')

  // Optional toggles
  const [hideWatermark, setHideWatermark] = useState(false)
  const [hidePrincipalSign, setHidePrincipalSign] = useState(false)
  const [showTopHeaderTagline, setShowTopHeaderTagline] = useState(true)
  const [printQr, setPrintQr] = useState(true)
  const [showBloodGroup, setShowBloodGroup] = useState(true)
  const [bottomNotes, setBottomNotes] = useState(
    'This card belongs to the school/institute. If found, please hand it over to the school/institute authorities.'
  )

  const handleUpdateLiveField = (field: string, val: any) => {
    if (field === 'schoolName') setSchoolName(val)
    else if (field === 'tagline') setTagline(val)
    else if (field === 'schoolAddress') setSchoolAddress(val)
    else if (field === 'schoolPhone') setSchoolPhone(val)
    else if (field === 'schoolEmail') setSchoolEmail(val)
    else if (field === 'session') setSession(val)
    else if (field === 'title') setTitle(val)
    else if (field === 'principalName') setPrincipalName(val)
    else if (field === 'bottomNotes') setBottomNotes(val)
  }

  // When role changes, update default title
  const handleRoleChange = (newRole: 'Student' | 'Teacher' | 'Employee') => {
    setRole(newRole)
    if (newRole === 'Student') setTitle('STUDENT IDENTITY CARD')
    else if (newRole === 'Teacher') setTitle('FACULTY IDENTITY CARD')
    else setTitle('STAFF IDENTITY CARD')
  }

  // Get current design orientations (strictly 2 allowed: 1 Vertical, 2 Horizontal)
  const isLandscape = selectedDesign === 2

  // Designs list for current role (strictly 2 designs per role)
  const roleDesigns = [
    {
      id: 1,
      name: role === 'Student' 
        ? 'Design 1: Smart ID Badge (Vertical)' 
        : role === 'Teacher' 
          ? 'Design 1: Executive Faculty Pass (Vertical)' 
          : 'Design 1: Corporate Staff Badge (Vertical)',
      badge: 'Vertical Format',
      orientation: 'Portrait (Vertical)',
      dimensions: '280 × 450 px',
      accentColor: role === 'Student' ? '#0284c7' : role === 'Teacher' ? '#831843' : '#2563eb',
      bgPreview: role === 'Student' 
        ? 'from-[#0f2b5c] to-[#0284c7]' 
        : role === 'Teacher' 
          ? 'from-[#581c87] to-[#831843]' 
          : 'from-[#0f172a] to-[#2563eb]'
    },
    {
      id: 2,
      name: role === 'Student' 
        ? 'Design 2: Campus RFID Card (Horizontal)' 
        : role === 'Teacher' 
          ? 'Design 2: Prestige Faculty Badge (Horizontal)' 
          : 'Design 2: Modern Tech Staff Card (Horizontal)',
      badge: 'Horizontal Format',
      orientation: 'Landscape (Horizontal)',
      dimensions: '450 × 280 px',
      accentColor: role === 'Student' ? '#047857' : role === 'Teacher' ? '#0d9488' : '#4338ca',
      bgPreview: role === 'Student' 
        ? 'from-[#064e3b] to-[#047857]' 
        : role === 'Teacher' 
          ? 'from-[#0f172a] to-[#0d9488]' 
          : 'from-[#1e1b4b] to-[#4338ca]'
    }
  ]

  const handleSave = async () => {
    try {
      await saveIdCardSetup({
        title,
        cardFor: role,
        session,
        designId: selectedDesign,
        tagline,
        schoolName,
        schoolAddress,
        udiseCode,
        schoolCode,
        affiliatedTo,
        affiliationCode,
        schoolPhone,
        schoolEmail,
        showWatermark: !hideWatermark,
        showPrincipalSign: !hidePrincipalSign,
        showTopHeaderTagline,
        printQr,
        showBloodGroup,
        bottomNotes,
        themeColor,
        principalName,
        customLabels
      })
    } catch (e) {
      console.error(e)
    }
    // Navigate back to setup with saved notification
    router.push('/institute/id-card/setup?saved=true')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Edit ID Card Content</h1>
            <p className="text-xs text-slate-500 font-medium">Customize institute details, branding, signatures, and toggles for this ID card frame</p>
          </div>
        </div>
        <Link 
          href="/institute/id-card/setup" 
          className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-10">
        
        {/* Id card Details */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 whitespace-nowrap uppercase tracking-wider">
              1. ID Card Basic Details
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ID Card For <span className="text-red-500">*</span></label>
              <select 
                value={role} 
                onChange={(e) => handleRoleChange(e.target.value as any)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-700 dark:text-slate-200"
              >
                <option value="Student">Student (2 Dedicated Designs)</option>
                <option value="Teacher">Teacher (2 Dedicated Designs)</option>
                <option value="Employee">Employee (2 Dedicated Designs)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Header Title <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter Title" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tagline / Subtitle</label>
              <input 
                type="text" 
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Enter Tagline" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Academic Session <span className="text-red-500">*</span></label>
              <select 
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-700 dark:text-slate-200"
              >
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
              </select>
            </div>
          </div>
        </section>

        {/* Theme Color Selection (Exact Match to Admit Card / Marksheet) */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 whitespace-nowrap uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-teal-600" />
              2. ID Card Theme Color & Styling
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Select Theme Color
                </p>
                <p className="text-[11px] text-slate-400">
                  Pick a curated preset or custom hex code. The entire ID card headers, borders, QR codes, and badges update automatically.
                </p>
              </div>

              {/* Color input */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-slate-300">|</span>
                <input
                  type="text"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  placeholder="#0284c7"
                  maxLength={7}
                  className="w-18 text-xs font-mono font-bold uppercase bg-transparent outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Presets:
              </span>
              {ID_CARD_COLOR_PRESETS.map(preset => {
                const isSelected = themeColor.toLowerCase() === preset.hex.toLowerCase()
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setThemeColor(preset.hex)}
                    title={preset.name}
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
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Id Card Design Selection (Strictly 2 designs per role: 1 Vertical & 1 Horizontal) */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 w-full">
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 whitespace-nowrap uppercase tracking-wider">
                3. {role} ID Card Design Frame (1 Vertical & 1 Horizontal)
              </h2>
              <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            Only 2 specialized ID card design frames are allowed per category (Vertical and Horizontal). Layout frame is fixed — customize institute branding and content details below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            {roleDesigns.map((design) => {
              const isSelected = selectedDesign === design.id

              return (
                <div
                  key={design.id}
                  onClick={() => setSelectedDesign(design.id)}
                  className={`cursor-pointer rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 shadow-md ring-2 ring-teal-500/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                          {design.name}
                        </span>
                        {isSelected && (
                          <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Active Frame
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {design.orientation}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {design.dimensions}
                        </span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Thumbnail Mockup */}
                  <div className="w-full h-32 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-3 overflow-hidden relative">
                    <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
                    
                    {design.id === 1 ? (
                      // Portrait thumbnail 1
                      <div className="w-20 h-28 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                        <div className={`h-8 w-full bg-gradient-to-r ${design.bgPreview} flex items-center justify-center`}>
                          <div className="w-10 h-1 bg-white/60 rounded-full"></div>
                        </div>
                        <div className="flex-1 flex flex-col items-center pt-1.5 px-1">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 mb-1 border border-white"></div>
                          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded mb-1"></div>
                          <div className="w-14 h-1 bg-slate-200 dark:bg-slate-700 rounded mb-0.5"></div>
                          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 flex items-center justify-between px-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-xs"></div>
                          <div className="w-4 h-1 bg-slate-400 rounded-xs"></div>
                        </div>
                      </div>
                    ) : (
                      // Landscape thumbnail 2
                      <div className="w-36 h-22 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                        <div className={`h-5 w-full bg-gradient-to-r ${design.bgPreview} flex items-center justify-between px-2`}>
                          <div className="w-12 h-1 bg-white/70 rounded-full"></div>
                          <div className="w-4 h-1 bg-white/50 rounded-full"></div>
                        </div>
                        <div className="flex-1 flex p-1.5 gap-1.5 items-center">
                          <div className="w-8 h-10 rounded bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                          <div className="flex-1 space-y-1">
                            <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-600 rounded"></div>
                            <div className="w-20 h-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="w-14 h-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 flex items-center justify-between px-2">
                          <div className="w-8 h-1 bg-slate-400 rounded-xs"></div>
                          <div className="w-3 h-1 bg-slate-400 rounded-xs"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* School Information */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 whitespace-nowrap uppercase tracking-wider">
              3. Institute Header Information
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">School Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter School Name" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">School Address <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                placeholder="Enter Address" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">UDISE Code</label>
              <input 
                type="text" 
                value={udiseCode}
                onChange={(e) => setUdiseCode(e.target.value)}
                placeholder="Enter UDISE Code" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">School Code</label>
              <input 
                type="text" 
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="Enter School Code" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Affiliated To</label>
              <input 
                type="text" 
                value={affiliatedTo}
                onChange={(e) => setAffiliatedTo(e.target.value)}
                placeholder="Enter Affiliated To" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Affiliation Code</label>
              <input 
                type="text" 
                value={affiliationCode}
                onChange={(e) => setAffiliationCode(e.target.value)}
                placeholder="Enter Affiliation Code" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">School Contact No. <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={schoolPhone}
                onChange={(e) => setSchoolPhone(e.target.value)}
                placeholder="Enter Mobile No." 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">School Email <span className="text-red-500">*</span></label>
              <input 
                type="email" 
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
                placeholder="Enter Email" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
          </div>
        </section>

        {/* Live Preview & Options */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 whitespace-nowrap uppercase tracking-wider">
              4. Customization & Live Card Preview
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            
            {/* Left Column: Toggles & Options */}
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={!hideWatermark} 
                    onChange={(e) => setHideWatermark(!e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Show Emblem Watermark</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={!hidePrincipalSign} 
                    onChange={(e) => setHidePrincipalSign(!e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Show Authority Signature</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={showTopHeaderTagline} 
                    onChange={(e) => setShowTopHeaderTagline(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Show Header Tagline</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={printQr} 
                    onChange={(e) => setPrintQr(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Print QR for Attendance</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={showBloodGroup} 
                    onChange={(e) => setShowBloodGroup(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Blood Group</span>
                </label>

              </div>

              {/* Bottom Notes */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Card Terms & Bottom Note <span className="text-[10px] text-slate-400 font-normal">(Printed on Back)</span>
                </label>
                <textarea 
                  rows={3}
                  value={bottomNotes}
                  onChange={(e) => setBottomNotes(e.target.value)}
                  placeholder="This card belongs to the school/institute. If found, please return..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-300 resize-none"
                ></textarea>
              </div>
            </div>

            {/* Right Column: Live Interactive Preview */}
            <div className="w-full lg:w-[480px] shrink-0 flex flex-col items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              
              {/* Preview Controls */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Live Preview ({role})
                  </span>
                </div>

                {/* Front / Back Toggle */}
                <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => setActiveSide('front')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeSide === 'front' 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Front Side
                  </button>
                  <button
                    onClick={() => setActiveSide('back')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeSide === 'back' 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Back Side
                  </button>
                </div>
              </div>

              {/* Card Container with Responsive Fit */}
              <div className="w-full min-h-[460px] bg-slate-200/60 dark:bg-slate-800/60 rounded-xl p-4 flex items-center justify-center overflow-hidden border border-slate-200/80 dark:border-slate-700">
                <div 
                  className="transition-transform duration-200 flex items-center justify-center"
                  style={{ 
                    transform: isLandscape ? 'scale(0.85)' : 'scale(0.92)',
                    transformOrigin: 'center' 
                  }}
                >
                  {activeSide === 'back' ? (
                    <IdCardBackDesign 
                      orientation={isLandscape ? 'landscape' : 'portrait'}
                      schoolName={schoolName}
                      schoolAddress={schoolAddress}
                      schoolPhone={schoolPhone}
                      schoolEmail={schoolEmail}
                      bottomNotes={bottomNotes}
                      themeColor={themeColor}
                      editable={true}
                      onUpdateField={handleUpdateLiveField}
                    />
                  ) : (
                    <>
                      {/* Student Designs */}
                      {role === 'Student' && selectedDesign === 1 && (
                        <StudentDesignVertical 
                          schoolName={schoolName}
                          schoolAddress={schoolAddress}
                          schoolPhone={schoolPhone}
                          title={title}
                          tagline={tagline}
                          session={session}
                          affiliationCode={affiliationCode}
                          showWatermark={!hideWatermark}
                          showPrincipalSign={!hidePrincipalSign}
                          showTopHeaderTagline={showTopHeaderTagline}
                          showQr={printQr}
                          showBloodGroup={showBloodGroup}
                          themeColor={themeColor}
                          principalName={principalName}
                          editable={true}
                          customLabels={customLabels}
                          onUpdateField={handleUpdateLiveField}
                          onUpdateLabel={(k, v) => setCustomLabels(p => ({ ...p, [k]: v }))}
                        />
                      )}
                      {role === 'Student' && selectedDesign === 2 && (
                        <StudentDesignHorizontal 
                          schoolName={schoolName}
                          schoolAddress={schoolAddress}
                          schoolPhone={schoolPhone}
                          title={title}
                          tagline={tagline}
                          session={session}
                          affiliationCode={affiliationCode}
                          showWatermark={!hideWatermark}
                          showPrincipalSign={!hidePrincipalSign}
                          showQr={printQr}
                          showBloodGroup={showBloodGroup}
                          themeColor={themeColor}
                          principalName={principalName}
                          editable={true}
                          customLabels={customLabels}
                          onUpdateField={handleUpdateLiveField}
                          onUpdateLabel={(k, v) => setCustomLabels(p => ({ ...p, [k]: v }))}
                        />
                      )}

                      {/* Teacher Designs */}
                      {role === 'Teacher' && selectedDesign === 1 && (
                        <TeacherDesignVertical 
                          schoolName={schoolName}
                          schoolAddress={schoolAddress}
                          schoolPhone={schoolPhone}
                          title={title}
                          tagline={tagline}
                          session={session}
                          affiliationCode={affiliationCode}
                          showWatermark={!hideWatermark}
                          showPrincipalSign={!hidePrincipalSign}
                          showTopHeaderTagline={showTopHeaderTagline}
                          showQr={printQr}
                          showBloodGroup={showBloodGroup}
                          themeColor={themeColor}
                          principalName={principalName}
                          editable={true}
                          customLabels={customLabels}
                          onUpdateField={handleUpdateLiveField}
                          onUpdateLabel={(k, v) => setCustomLabels(p => ({ ...p, [k]: v }))}
                        />
                      )}
                      {role === 'Teacher' && selectedDesign === 2 && (
                        <TeacherDesignHorizontal 
                          schoolName={schoolName}
                          schoolAddress={schoolAddress}
                          schoolPhone={schoolPhone}
                          title={title}
                          tagline={tagline}
                          session={session}
                          showWatermark={!hideWatermark}
                          showPrincipalSign={!hidePrincipalSign}
                          showQr={printQr}
                          showBloodGroup={showBloodGroup}
                          themeColor={themeColor}
                          principalName={principalName}
                          editable={true}
                          customLabels={customLabels}
                          onUpdateField={handleUpdateLiveField}
                          onUpdateLabel={(k, v) => setCustomLabels(p => ({ ...p, [k]: v }))}
                        />
                      )}

                      {/* Employee Designs */}
                      {role === 'Employee' && selectedDesign === 1 && (
                        <EmployeeDesignVertical 
                          schoolName={schoolName}
                          schoolAddress={schoolAddress}
                          schoolPhone={schoolPhone}
                          title={title}
                          tagline={tagline}
                          session={session}
                          affiliationCode={affiliationCode}
                          showWatermark={!hideWatermark}
                          showPrincipalSign={!hidePrincipalSign}
                          showTopHeaderTagline={showTopHeaderTagline}
                          showQr={printQr}
                          showBloodGroup={showBloodGroup}
                          themeColor={themeColor}
                          principalName={principalName}
                          editable={true}
                          customLabels={customLabels}
                          onUpdateField={handleUpdateLiveField}
                          onUpdateLabel={(k, v) => setCustomLabels(p => ({ ...p, [k]: v }))}
                        />
                      )}
                      {role === 'Employee' && selectedDesign === 2 && (
                        <EmployeeDesignHorizontal 
                          schoolName={schoolName}
                          schoolAddress={schoolAddress}
                          schoolPhone={schoolPhone}
                          title={title}
                          tagline={tagline}
                          session={session}
                          showWatermark={!hideWatermark}
                          showPrincipalSign={!hidePrincipalSign}
                          showQr={printQr}
                          showBloodGroup={showBloodGroup}
                          themeColor={themeColor}
                          principalName={principalName}
                          editable={true}
                          customLabels={customLabels}
                          onUpdateField={handleUpdateLiveField}
                          onUpdateLabel={(k, v) => setCustomLabels(p => ({ ...p, [k]: v }))}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between w-full text-[11px] text-slate-500 px-1 font-medium">
                <span>Orientation: <strong className="text-slate-700 dark:text-slate-300">{isLandscape ? 'Landscape (Horizontal)' : 'Portrait (Vertical)'}</strong></span>
                <span>Role: <strong className="text-teal-600">{role}</strong></span>
              </div>
            </div>

          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link 
            href="/institute/id-card/setup" 
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
            Save Content Changes
          </button>
        </div>

      </div>
    </div>
  )
}

export default function GenerateIdCardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold text-slate-500">Loading ID Card Generator...</div>}>
      <GenerateIdCardContent />
    </Suspense>
  )
}

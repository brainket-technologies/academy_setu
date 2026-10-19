'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { 
  X, 
  Check, 
  Eye, 
  RotateCw, 
  Sparkles, 
  Palette, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Award,
  Pencil,
  Sliders,
  Building2,
  Calendar,
  FileText,
  PenTool,
  UserCheck,
  GraduationCap,
  Briefcase,
  Globe,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  UniversalIdCardRender,
  IdCardBackDesign,
  ID_CARD_COLOR_PRESETS,
  ID_CARD_DESIGNS,
  IdCardRole,
  ID_CARD_ROLE_PREVIEWS
} from '@/components/id-cards/IdCardTemplates'
import { saveIdCardSetup, fetchCurrentInstitutionDetails } from '../../actions'

function GenerateIdCardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialDesignParam = Number(searchParams.get('design')) || 1
  const initialDesign = [1, 2, 3, 4].includes(initialDesignParam) ? (initialDesignParam as 1 | 2 | 3 | 4) : 1

  const initialRoleParam = searchParams.get('role') || searchParams.get('cardFor') || 'Student'
  const initialRole: IdCardRole = ['Student', 'Teacher', 'Employee', 'Universal'].includes(initialRoleParam)
    ? (initialRoleParam as IdCardRole)
    : 'Student'

  const [selectedRole, setSelectedRole] = useState<IdCardRole>(initialRole)
  const [selectedDesign, setSelectedDesign] = useState<1 | 2 | 3 | 4>(initialDesign)
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front')

  const initialColor = searchParams.get('color') || '#0284c7'
  const [themeColor, setThemeColor] = useState<string>(initialColor)
  const [principalName, setPrincipalName] = useState('K.Singhal')
  const [principalSign, setPrincipalSign] = useState<string | null>(null)
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null)
  const [isAutoFetching, setIsAutoFetching] = useState(false)
  const [autoFetchNotice, setAutoFetchNotice] = useState<string | null>(null)
  const [holderSignName, setHolderSignName] = useState(ID_CARD_ROLE_PREVIEWS[initialRole].holderSignName)
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({})

  // Form Fields
  const [title, setTitle] = useState(ID_CARD_ROLE_PREVIEWS[initialRole].defaultTitle)
  const [tagline, setTagline] = useState(ID_CARD_ROLE_PREVIEWS[initialRole].defaultTagline)
  const [session, setSession] = useState('2025-26')
  const [schoolName, setSchoolName] = useState('COSMOPOLITAN INTER COLLEGE')
  const [schoolAddress, setSchoolAddress] = useState('Knowledge Park, Sector 62, New Delhi')
  const [udiseCode, setUdiseCode] = useState('09120401882')
  const [schoolCode, setSchoolCode] = useState('SCH-8841')
  const [affiliatedTo, setAffiliatedTo] = useState('CBSE, New Delhi')
  const [affiliationCode, setAffiliationCode] = useState('CBSE-213089')
  const [schoolPhone, setSchoolPhone] = useState('+91 11 2345 6789')
  const [schoolEmail, setSchoolEmail] = useState('info@academy.edu')

  // Field Hide/Show Options
  const [showAdmNo, setShowAdmNo] = useState(true)
  const [showRollNo, setShowRollNo] = useState(true)
  const [showFatherName, setShowFatherName] = useState(true)
  const [showDob, setShowDob] = useState(true)
  const [showContact, setShowContact] = useState(true)
  const [showBloodGroup, setShowBloodGroup] = useState(true)
  const [showTopHeaderTagline, setShowTopHeaderTagline] = useState(true)
  const [printQr, setPrintQr] = useState(true)
  const [hideWatermark, setHideWatermark] = useState(false)

  // Separate Signatures
  const [hidePrincipalSign, setHidePrincipalSign] = useState(false)
  const [showHolderSign, setShowHolderSign] = useState(true)

  const [bottomNotes, setBottomNotes] = useState(
    'This card belongs to the institute. If found, please return to the institute authorities.'
  )

  const activeDesignMeta = ID_CARD_DESIGNS.find(d => d.id === selectedDesign) || ID_CARD_DESIGNS[0]
  const isLandscape = activeDesignMeta.orientation === 'Horizontal'

  // Auto-fetch Official Institution Details & Principal Signature on Mount
  useEffect(() => {
    let isMounted = true
    async function loadInstData() {
      setIsAutoFetching(true)
      try {
        const res = await fetchCurrentInstitutionDetails()
        if (isMounted && res.success && res.data) {
          if (res.data.principalName) setPrincipalName(res.data.principalName)
          if (res.data.principalSign) setPrincipalSign(res.data.principalSign)
          if (res.data.schoolLogo) setSchoolLogo(res.data.schoolLogo)
          if (res.data.schoolName) setSchoolName(res.data.schoolName)
          if (res.data.schoolAddress) setSchoolAddress(res.data.schoolAddress)
          if (res.data.schoolPhone) setSchoolPhone(res.data.schoolPhone)
          if (res.data.schoolEmail) setSchoolEmail(res.data.schoolEmail)
          if (res.data.affiliatedTo) setAffiliatedTo(res.data.affiliatedTo)
          if (res.data.affiliationCode) setAffiliationCode(res.data.affiliationCode)
          setAutoFetchNotice('Auto-fetched institution details & official signature')
          setTimeout(() => setAutoFetchNotice(null), 4000)
        }
      } catch (e) {
        console.error('Failed to auto-fetch institution details', e)
      } finally {
        if (isMounted) setIsAutoFetching(false)
      }
    }
    loadInstData()
    return () => { isMounted = false }
  }, [])

  const handleManualAutoFetch = async () => {
    setIsAutoFetching(true)
    try {
      const res = await fetchCurrentInstitutionDetails()
      if (res.success && res.data) {
        if (res.data.principalName) setPrincipalName(res.data.principalName)
        if (res.data.principalSign) setPrincipalSign(res.data.principalSign)
        if (res.data.schoolLogo) setSchoolLogo(res.data.schoolLogo)
        setAutoFetchNotice('Official Principal signature & logo re-synced!')
        setTimeout(() => setAutoFetchNotice(null), 4000)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsAutoFetching(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setSchoolLogo(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setPrincipalSign(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelectRole = (newRole: IdCardRole) => {
    setSelectedRole(newRole)
    const persona = ID_CARD_ROLE_PREVIEWS[newRole]
    setTitle(persona.defaultTitle)
    setTagline(persona.defaultTagline)
    setHolderSignName(persona.holderSignName)
    setCustomLabels({
      rollNoLabel: newRole === 'Teacher' || newRole === 'Employee' ? 'Department:' : 'Roll No:',
      admNoLabel: newRole === 'Teacher' ? 'Faculty ID:' : newRole === 'Employee' ? 'Staff ID:' : 'Adm No:',
      fatherNameLabel: newRole === 'Teacher' ? 'Qualification:' : newRole === 'Employee' ? 'Work Station:' : "Father's Name:",
      dobLabel: newRole === 'Teacher' || newRole === 'Employee' ? 'Joining Date:' : 'D.O.B:',
      emergencyNoLabel: newRole === 'Teacher' || newRole === 'Employee' ? 'Official Phone:' : 'Emergency No:',
      holderSignLabel: persona.holderSignLabel
    })
  }

  const handleUpdateLiveField = (field: string, val: any) => {
    if (field === 'schoolName') setSchoolName(val)
    else if (field === 'tagline') setTagline(val)
    else if (field === 'schoolAddress') setSchoolAddress(val)
    else if (field === 'schoolPhone') setSchoolPhone(val)
    else if (field === 'schoolEmail') setSchoolEmail(val)
    else if (field === 'session') setSession(val)
    else if (field === 'title') setTitle(val)
    else if (field === 'principalName') setPrincipalName(val)
    else if (field === 'holderSignName') setHolderSignName(val)
    else if (field === 'bottomNotes') setBottomNotes(val)
  }

  const handleSave = async () => {
    try {
      await saveIdCardSetup({
        title,
        cardFor: selectedRole,
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
        showHolderSign,
        showFatherName,
        showDob,
        showAdmNo,
        showRollNo,
        showContact,
        holderSignName,
        showTopHeaderTagline,
        printQr,
        showBloodGroup,
        bottomNotes,
        themeColor,
        principalName,
        principalSign: principalSign || undefined,
        schoolLogo: schoolLogo || undefined,
        customLabels
      })
    } catch (e) {
      console.error(e)
    }
    // Navigate back to setup with saved notification
    router.push('/institute/id-card/setup?saved=true')
  }

  const getFieldLabels = () => {
    if (selectedRole === 'Teacher') {
      return {
        admNo: 'Faculty ID',
        rollNo: 'Department',
        fatherName: 'Qualification / Credentials',
        dob: 'Date of Joining',
        bloodGroup: 'Blood Group',
        contact: 'Official Phone',
        tagline: 'Header Subtitle',
        qr: 'Biometric QR',
        watermark: 'Emblem Watermark',
        signTitle: 'Teacher Signature (Separate Sign)',
        signBadge: 'Teaching Faculty',
        signPlaceholder: 'e.g. Teacher Sign / Dr. Meenakshi'
      }
    }
    if (selectedRole === 'Employee') {
      return {
        admNo: 'Staff ID',
        rollNo: 'Department',
        fatherName: 'Work Station / Location',
        dob: 'Date of Joining / DOB',
        bloodGroup: 'Blood Group',
        contact: 'Official Phone',
        tagline: 'Header Subtitle',
        qr: 'Security Pass QR',
        watermark: 'Emblem Watermark',
        signTitle: 'Staff Signature (Separate Sign)',
        signBadge: 'Non-Teaching Staff',
        signPlaceholder: 'e.g. Staff Sign / V.S. Rathore'
      }
    }
    return {
      admNo: 'Admission / ID No.',
      rollNo: 'Roll No. / Section',
      fatherName: 'Father / Guardian',
      dob: 'Date of Birth / DOJ',
      bloodGroup: 'Blood Group',
      contact: 'Contact Phone',
      tagline: 'Header Subtitle',
      qr: 'Attendance QR',
      watermark: 'Emblem Watermark',
      signTitle: 'Cardholder / Student Signature (Separate Sign)',
      signBadge: 'Student Sign',
      signPlaceholder: 'e.g. Student Sign / Aarav S.'
    }
  }
  const fieldLabels = getFieldLabels()

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Create / Customize ID Card</h1>
            <p className="text-xs text-slate-500 font-medium">Select design template & theme color • See instant live preview below • Customize institute branding</p>
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
        
        {/* ─── SECTION 1: TARGET ROLE / AUDIENCE CATEGORY ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 whitespace-nowrap uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-teal-600" />
              1. Select Target Role / Card Category <span className="text-red-500">*</span>
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Select who this card is being created for. Preview columns, field visibility labels, and credentials automatically adapt based on your selected role:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'Student' as const,
                title: 'Student ID Card',
                badge: 'Students & Scholars',
                desc: 'Admission No, Roll No, Class, Father Name, DOB & Student Signature',
                icon: GraduationCap,
                color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800'
              },
              {
                id: 'Teacher' as const,
                title: 'Teacher / Faculty Pass',
                badge: 'Teaching Faculty',
                desc: 'Faculty ID, Department, Designation, Qualification, DOJ & Teacher Signature',
                icon: Briefcase,
                color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
              },
              {
                id: 'Employee' as const,
                title: 'Employee / Staff Card',
                badge: 'Non-Teaching Staff',
                desc: 'Staff ID, Department, Work Station, Emergency Phone & Staff Signature',
                icon: Building2,
                color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
              },
              {
                id: 'Universal' as const,
                title: 'Universal (All Roles)',
                badge: 'Multi-Role Format',
                desc: 'Flexible unified format compatible across students, faculty & staff',
                icon: Globe,
                color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800'
              }
            ].map(role => {
              const isSelected = selectedRole === role.id
              const Icon = role.icon
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role.id)}
                  className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/30 ring-2 ring-teal-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold border ${role.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] font-black bg-teal-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                        <Check className="w-3 h-3" />
                        Selected
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                        {role.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-0.5">
                    {role.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {role.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        {/* ─── SECTION 2: SELECT DESIGN OPTION (WITH MINIATURE PREVIEW) ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 whitespace-nowrap uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              2. Select ID Card Design Option <span className="text-red-500">*</span>
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
          </div>

          <p className="text-xs text-slate-500 mb-5">
            Click any of the 4 design templates below. All designs are universal for students, faculty, and institute personnel. Live preview automatically updates below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ID_CARD_DESIGNS.map((design) => {
              const isSelected = selectedDesign === design.id

              return (
                <div
                  key={design.id}
                  onClick={() => setSelectedDesign(design.id)}
                  className={`cursor-pointer rounded-2xl border-2 p-3.5 transition-all flex flex-col justify-between relative group ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 shadow-lg ring-2 ring-teal-500/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 hover:shadow-md bg-white dark:bg-slate-800'
                  }`}
                >
                  {/* Active Indicator Badge */}
                  {isSelected && (
                    <div className="absolute -top-2.5 right-3 bg-teal-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Selected Design
                    </div>
                  )}

                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-5 h-5 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          #{design.id}
                        </span>
                        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                          {design.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {design.orientation}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[9.5px] font-mono text-slate-400">
                        {design.dimensions}
                      </span>
                    </div>

                    {/* Miniature Card Preview Inside Selection Tile */}
                    <div className="w-full h-44 bg-slate-100/80 dark:bg-slate-900/60 rounded-xl my-2 flex items-center justify-center overflow-hidden border border-slate-200/70 relative">
                      <div 
                        className="pointer-events-none select-none flex items-center justify-center drop-shadow-sm transition-transform duration-200 group-hover:scale-[0.38]"
                        style={{
                          transform: design.orientation === 'Horizontal' ? 'scale(0.36)' : 'scale(0.34)',
                          transformOrigin: 'center'
                        }}
                      >
                        <UniversalIdCardRender
                          designId={design.id}
                          cardFor={selectedRole}
                          data={ID_CARD_ROLE_PREVIEWS[selectedRole]}
                          themeColor={themeColor}
                          schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                          tagline={tagline}
                          session={session}
                          title={title}
                          principalName={principalName}
                          principalSign={principalSign || undefined}
                          schoolLogo={schoolLogo || undefined}
                          editable={false}
                        />
                      </div>
                    </div>

                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                      {design.description}
                    </p>
                  </div>

                  {/* Visual card ratio footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-bold">
                    <span className={isSelected ? 'text-teal-600 font-black' : 'text-slate-400'}>
                      {isSelected ? '✓ Active Template' : 'Click to Select'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {design.orientation === 'Vertical' ? 'Portrait CR80' : 'Landscape CR80'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── SECTION 3: THEME COLOR PALETTE & STYLING ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 whitespace-nowrap uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-teal-600" />
              3. ID Card Theme Color & Styling
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Select Theme Color (Updates all templates & preview instantly)
                </p>
                <p className="text-[11px] text-slate-400">
                  Pick any color preset or custom hex code. Card headers, borders, QR codes, and badges update in real-time.
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

        {/* ─── SECTION 4: LIVE PREVIEW & DYNAMIC ROLE FIELDS ─── */}
        <section className="bg-slate-50/80 dark:bg-slate-900/60 border-2 border-teal-500/30 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <span>Live Template Preview</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                    Role: {selectedRole}
                  </span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 px-2.5 py-0.5 rounded-full font-bold">
                    Active: Design {selectedDesign} ({activeDesignMeta.orientation})
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold hidden sm:inline-flex items-center gap-1">
                    <Pencil className="w-2.5 h-2.5" />
                    Click Any Card Text to Edit
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Direct interactive preview — columns and credentials automatically update when you switch role ({selectedRole})
                </p>
              </div>
            </div>

            {/* Front / Back Toggle */}
            <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveSide('front')}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  activeSide === 'front' 
                    ? 'bg-teal-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                Front Side
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('back')}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  activeSide === 'back' 
                    ? 'bg-teal-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                Back Side
              </button>
            </div>
          </div>

          {/* Centered Large Interactive Preview */}
          <div className="w-full min-h-[490px] bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center overflow-hidden border border-slate-200/80 dark:border-slate-700 relative">
            <div 
              className="transition-transform duration-300 flex items-center justify-center drop-shadow-xl"
              style={{ 
                transform: isLandscape ? 'scale(0.96)' : 'scale(0.96)',
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
                <UniversalIdCardRender
                  designId={selectedDesign}
                  cardFor={selectedRole}
                  data={ID_CARD_ROLE_PREVIEWS[selectedRole]}
                  schoolName={schoolName}
                  schoolAddress={schoolAddress}
                  schoolPhone={schoolPhone}
                  schoolEmail={schoolEmail}
                  title={title}
                  tagline={tagline}
                  session={session}
                  affiliationCode={affiliationCode}
                  showWatermark={!hideWatermark}
                  showPrincipalSign={!hidePrincipalSign}
                  showHolderSign={showHolderSign}
                  showFatherName={showFatherName}
                  showDob={showDob}
                  showAdmNo={showAdmNo}
                  showRollNo={showRollNo}
                  showContact={showContact}
                  holderSignName={holderSignName}
                  showTopHeaderTagline={showTopHeaderTagline}
                  showQr={printQr}
                  showBloodGroup={showBloodGroup}
                  themeColor={themeColor}
                  principalName={principalName}
                  principalSign={principalSign || undefined}
                  schoolLogo={schoolLogo || undefined}
                  editable={true}
                  customLabels={customLabels}
                  onUpdateField={handleUpdateLiveField}
                  onUpdateLabel={(k, v) => setCustomLabels(p => ({ ...p, [k]: v }))}
                />
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-medium mt-4 text-center">
              Standard CR80 Format • {activeDesignMeta.dimensions} • Click any text directly on the card to edit in real-time
            </p>
          </div>

          {/* ─── CARD FIELD VISIBILITY & DUAL SIGNATURE CONTROLS ─── */}
          <div className="flex flex-col gap-6 pt-3 border-t border-slate-200 dark:border-slate-700">
            {/* 1. Field Visibility (Hide/Show) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-teal-600" />
                  Field Visibility Controls ({selectedRole} Mode)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Toggle any field below to immediately show or hide it on the live preview
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all ${showAdmNo ? 'bg-white dark:bg-slate-800 border-teal-500/40 text-teal-900 dark:text-teal-200 shadow-2xs' : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 text-slate-400'}`}>
                  <input 
                    type="checkbox" 
                    checked={showAdmNo} 
                    onChange={(e) => setShowAdmNo(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-[11px] font-bold">{fieldLabels.admNo}</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all ${showRollNo ? 'bg-white dark:bg-slate-800 border-teal-500/40 text-teal-900 dark:text-teal-200 shadow-2xs' : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 text-slate-400'}`}>
                  <input 
                    type="checkbox" 
                    checked={showRollNo} 
                    onChange={(e) => setShowRollNo(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-[11px] font-bold">{fieldLabels.rollNo}</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all ${showFatherName ? 'bg-white dark:bg-slate-800 border-teal-500/40 text-teal-900 dark:text-teal-200 shadow-2xs' : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 text-slate-400'}`}>
                  <input 
                    type="checkbox" 
                    checked={showFatherName} 
                    onChange={(e) => setShowFatherName(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-[11px] font-bold">{fieldLabels.fatherName}</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all ${showDob ? 'bg-white dark:bg-slate-800 border-teal-500/40 text-teal-900 dark:text-teal-200 shadow-2xs' : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 text-slate-400'}`}>
                  <input 
                    type="checkbox" 
                    checked={showDob} 
                    onChange={(e) => setShowDob(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-[11px] font-bold">{fieldLabels.dob}</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all ${showBloodGroup ? 'bg-white dark:bg-slate-800 border-teal-500/40 text-teal-900 dark:text-teal-200 shadow-2xs' : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 text-slate-400'}`}>
                  <input 
                    type="checkbox" 
                    checked={showBloodGroup} 
                    onChange={(e) => setShowBloodGroup(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-[11px] font-bold">{fieldLabels.bloodGroup}</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all ${showContact ? 'bg-white dark:bg-slate-800 border-teal-500/40 text-teal-900 dark:text-teal-200 shadow-2xs' : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 text-slate-400'}`}>
                  <input 
                    type="checkbox" 
                    checked={showContact} 
                    onChange={(e) => setShowContact(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-[11px] font-bold">{fieldLabels.contact}</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all ${showTopHeaderTagline ? 'bg-white dark:bg-slate-800 border-teal-500/40 text-teal-900 dark:text-teal-200 shadow-2xs' : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 text-slate-400'}`}>
                  <input 
                    type="checkbox" 
                    checked={showTopHeaderTagline} 
                    onChange={(e) => setShowTopHeaderTagline(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-[11px] font-bold">{fieldLabels.tagline}</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all ${printQr ? 'bg-white dark:bg-slate-800 border-teal-500/40 text-teal-900 dark:text-teal-200 shadow-2xs' : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 text-slate-400'}`}>
                  <input 
                    type="checkbox" 
                    checked={printQr} 
                    onChange={(e) => setPrintQr(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-[11px] font-bold">{fieldLabels.qr}</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all ${!hideWatermark ? 'bg-white dark:bg-slate-800 border-teal-500/40 text-teal-900 dark:text-teal-200 shadow-2xs' : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 text-slate-400'}`}>
                  <input 
                    type="checkbox" 
                    checked={!hideWatermark} 
                    onChange={(e) => setHideWatermark(!e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                  />
                  <span className="text-[11px] font-bold">{fieldLabels.watermark}</span>
                </label>
              </div>
            </div>

            {/* 2. Separate Signatures Configuration */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-teal-600" />
                  Separate Signatures (Show & Customize)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Display distinct Authority and Cardholder signature blocks separately on the card
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Authority / Principal Signature */}
                <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${!hidePrincipalSign ? 'bg-white dark:bg-slate-800 border-teal-500/50 shadow-xs' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 opacity-70'}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!hidePrincipalSign} 
                        onChange={(e) => setHidePrincipalSign(!e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                      />
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                        Authority / Principal Signature
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleManualAutoFetch}
                        disabled={isAutoFetching}
                        title="Auto-fetch official principal signature from Institution database"
                        className="text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-700 font-bold transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <RotateCw className={`w-3 h-3 ${isAutoFetching ? 'animate-spin' : ''}`} />
                        <span>Auto-Fetch Sign</span>
                      </button>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                        Official Seal
                      </span>
                    </div>
                  </div>

                  {autoFetchNotice && (
                    <div className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{autoFetchNotice}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Signatory Name
                      </label>
                      <input 
                        type="text" 
                        value={principalName}
                        onChange={(e) => setPrincipalName(e.target.value)}
                        placeholder="e.g. K.Singhal"
                        disabled={hidePrincipalSign}
                        className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>

                    {/* Preview Box: Real Sign Image or Cursive Text */}
                    <div className="h-12 w-32 border rounded-xl flex items-center justify-center p-1 bg-slate-50 dark:bg-slate-900/50 shadow-2xs overflow-hidden relative" style={{ borderColor: themeColor }}>
                      {principalSign ? (
                        <img 
                          src={principalSign} 
                          alt="Principal Signature" 
                          className="max-h-10 max-w-full object-contain" 
                        />
                      ) : (
                        <span className="font-serif italic font-black text-xs text-center" style={{ color: themeColor }}>
                          {principalName || 'K.Singhal'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Upload Custom Signature Image */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10.5px]">
                    <span className="text-slate-400 font-medium">Custom Signature File:</span>
                    <label className="cursor-pointer text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>{principalSign ? 'Change Signature Image' : 'Upload Signature Image'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleSignUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {/* Cardholder / Student Signature (Separate Sign!) */}
                <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${showHolderSign ? 'bg-white dark:bg-slate-800 border-teal-500/50 shadow-xs' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 opacity-70'}`}>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showHolderSign} 
                        onChange={(e) => setShowHolderSign(e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                      />
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                        {fieldLabels.signTitle}
                      </span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                      {fieldLabels.signBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Sign Label / Cardholder Name
                      </label>
                      <input 
                        type="text" 
                        value={holderSignName}
                        onChange={(e) => setHolderSignName(e.target.value)}
                        placeholder={fieldLabels.signPlaceholder}
                        disabled={!showHolderSign}
                        className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>
                    <div className="h-10 w-28 border border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center p-1 bg-slate-50 dark:bg-slate-900/50 shadow-2xs">
                      <span className="font-serif italic font-semibold text-xs text-slate-700 dark:text-slate-300">
                        {holderSignName || 'Cardholder'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: BASIC CARD & INSTITUTE DETAILS ─── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 whitespace-nowrap uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              5. Institute Information & Authority Signatures
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
          </div>

          {/* Institute Logo Showcase Box */}
          <div className="mb-6 p-4 rounded-2xl border border-teal-500/30 bg-teal-50/30 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Emblem Preview Container using new High-Contrast Design */}
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md border-2 border-amber-400 ring-2 ring-white/80 flex items-center justify-center shrink-0 overflow-hidden">
                {schoolLogo ? (
                  <img src={schoolLogo} alt="School Logo" className="w-full h-full object-contain filter drop-shadow-2xs" />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex flex-col items-center justify-center text-slate-900 shadow-inner">
                    <Building2 className="w-7 h-7 text-slate-900" />
                    <span className="text-[6.5px] font-black uppercase tracking-tighter mt-0.5">LOGO</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Institute Logo (Header Showcase Emblem)</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    High-Contrast Display
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {schoolLogo ? 'Official logo loaded and rendered in high-contrast header frame' : 'No custom logo uploaded yet — showing default campus crest'}
                </p>
                {schoolLogo && (
                  <button
                    type="button"
                    onClick={() => setSchoolLogo(null)}
                    className="text-[10.5px] text-red-500 hover:text-red-600 font-bold mt-1 inline-block"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
              <button
                type="button"
                onClick={handleManualAutoFetch}
                disabled={isAutoFetching}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isAutoFetching ? 'animate-spin text-teal-600' : ''}`} />
                <span>Auto-Fetch Logo</span>
              </button>
              <label className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Logo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload}
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Header Title <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. STUDENT / SCHOLAR IDENTITY CARD" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tagline / Subtitle</label>
              <input 
                type="text" 
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Center of Academic Excellence" 
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
                <option value="2027-28">2027-28</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Institute / School Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter Institute Name" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campus Address</label>
              <input 
                type="text" 
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                placeholder="Enter Address" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Principal / Authority Sign Name</label>
              <input 
                type="text" 
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                placeholder="e.g. K.Singhal" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cardholder / Student Sign Name <span className="text-[10px] text-teal-600 font-semibold">(Separate Sign)</span></label>
              <input 
                type="text" 
                value={holderSignName}
                onChange={(e) => setHolderSignName(e.target.value)}
                placeholder="e.g. Cardholder / Student Sign" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Helpline Phone</label>
              <input 
                type="text" 
                value={schoolPhone}
                onChange={(e) => setSchoolPhone(e.target.value)}
                placeholder="Enter Phone Number" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Email</label>
              <input 
                type="email" 
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
                placeholder="Enter Email" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Affiliation Code / ID</label>
              <input 
                type="text" 
                value={affiliationCode}
                onChange={(e) => setAffiliationCode(e.target.value)}
                placeholder="e.g. CBSE-213089" 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-200" 
              />
            </div>
          </div>

          {/* Bottom Notes for Back Side */}
          <div className="flex flex-col gap-2 mt-6">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Card Terms & Bottom Note <span className="text-[10px] text-slate-400 font-normal">(Printed on Back Side)</span>
            </label>
            <textarea 
              rows={2}
              value={bottomNotes}
              onChange={(e) => setBottomNotes(e.target.value)}
              placeholder="This card belongs to the institute. If found, please return..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs outline-none focus:border-teal-500 transition-all text-slate-700 dark:text-slate-300 resize-none"
            ></textarea>
          </div>
        </section>

        {/* ─── ACTION BUTTONS ─── */}
        <div className="flex items-center justify-end gap-4 border-t border-slate-200 dark:border-slate-700 pt-6">
          <Link
            href="/institute/id-card/setup"
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-bold text-xs transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-md hover:shadow-teal-500/25 flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save ID Card Setup (Design {selectedDesign})</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default function GenerateIdCardPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-xs font-bold text-slate-400">
        Loading ID Card Setup...
      </div>
    }>
      <GenerateIdCardContent />
    </Suspense>
  )
}

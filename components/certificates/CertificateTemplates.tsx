import React from 'react'
import { QrCode, Award, ShieldCheck, CheckCircle2, User, Upload } from 'lucide-react'
import { LiveEditableText, ProperQrCode, SampleSchoolLogo, hexToRgba } from '@/components/admit-card/AdmitCardModalPreview'

export { hexToRgba }

export function adjustHex(hex?: string, amount: number = 0): string {
  let c = (hex || '#1e3a8a').trim().replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  if (isNaN(num)) return amount < 0 ? '#0f2b5c' : '#38bdf8'
  const r = Math.max(0, Math.min(255, ((num >> 16) & 255) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amount))
  const b = Math.max(0, Math.min(255, (num & 255) + amount))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export function parseFontSize(size?: number | string): string | undefined {
  if (size === undefined || size === null || size === '') return undefined
  const str = String(size).trim()
  if (!str) return undefined
  if (str.endsWith('px') || str.endsWith('rem') || str.endsWith('em') || str.endsWith('%') || str.endsWith('pt')) {
    return str
  }
  const num = parseFloat(str)
  if (isNaN(num) || num <= 0) return undefined
  return `${num}px`
}

export const CERTIFICATE_COLOR_PRESETS = [
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Sky Blue', hex: '#0284C7' },
  { name: 'Ocean Teal', hex: '#0F766E' },
  { name: 'Royal Emerald', hex: '#065F46' },
  { name: 'Amber Gold', hex: '#B45309' },
  { name: 'Burgundy', hex: '#660033' },
  { name: 'Crimson', hex: '#991B1B' },
  { name: 'Indigo', hex: '#4338CA' },
  { name: 'Plum Purple', hex: '#701A75' },
  { name: 'Midnight Slate', hex: '#0F172A' }
]

export interface CertificateCustomProps {
  title?: string
  subtitle?: string
  presentedTo?: string
  themeColor?: string
  schoolName?: string
  schoolAddress?: string
  schoolLogo?: string
  logoWidth?: string | number
  logoHeight?: string | number
  showLogo?: boolean
  schoolNameFontSize?: string | number
  titleFontSize?: string | number
  subtitleFontSize?: string | number
  studentName?: string
  fatherName?: string
  motherName?: string
  admissionNo?: string
  rollNo?: string
  className?: string
  section?: string
  dob?: string
  gender?: string
  studentPhoto?: string
  showStudentPhoto?: boolean
  examName?: string
  session?: string
  content?: string
  date?: string
  awarder?: string
  principalName?: string
  principalLabel?: string
  teacherSignName?: string
  teacherSignLabel?: string
  controllerSignName?: string
  controllerSignLabel?: string
  parentSignName?: string
  parentSignLabel?: string
  secondarySignName?: string
  secondarySignLabel?: string
  studentSignLabel?: string
  showQr?: boolean
  showSeal?: boolean
  textColor?: string
  titleBgColor?: string
  hiddenFields?: string[]
  editable?: boolean
  customLabels?: Record<string, string>
  onUpdateField?: (field: string, value: string) => void
  onUpdateLabel?: (key: string, value: string) => void
}

// Common Gold Seal with Ribbons (Self-contained within bounding box so ribbons never get cut off)
const GoldSeal = ({ text = "OFFICIAL SEAL", ribbonColor = "#1e3a8a", className = "" }: { text?: string; ribbonColor?: string; className?: string }) => (
  <div className={`relative flex items-center justify-center select-none w-20 h-22 shrink-0 ${className}`}>
    {/* Ribbons */}
    <div 
      className="absolute bottom-0 left-[14px] w-5 h-9 -rotate-[28deg] z-0 shadow-xs" 
      style={{ 
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
        backgroundColor: ribbonColor
      }}
    ></div>
    <div 
      className="absolute bottom-0 right-[14px] w-5 h-9 rotate-[28deg] z-0 shadow-xs" 
      style={{ 
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
        backgroundColor: ribbonColor
      }}
    ></div>
    {/* Sunburst edges */}
    {[0, 30, 60, 90, 120, 150].map((deg) => (
      <div 
        key={deg} 
        className="absolute top-0 w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm shadow-xs" 
        style={{ transform: `rotate(${deg}deg)`, zIndex: 1 }}
      ></div>
    ))}
    {/* Inner golden disc */}
    <div className="absolute top-0 w-16 h-16 bg-gradient-to-b from-amber-300 via-amber-200 to-yellow-500 rounded-full z-10 border-2 border-amber-600/40 shadow-inner flex flex-col items-center justify-center p-1 text-center">
      <Award className="w-5 h-5 text-amber-900" />
      <span className="text-[6px] font-black text-amber-950 uppercase tracking-tighter leading-tight mt-0.5 px-0.5 line-clamp-1">
        {text}
      </span>
    </div>
  </div>
)

// Shared Student Academic & Personal Metadata Badges
export const CertificateStudentMetadata: React.FC<{
  isHidden: (field: string) => boolean
  customLabels?: Record<string, string>
  primary?: string
  fatherName?: string
  motherName?: string
  className?: string
  section?: string
  rollNo?: string
  admissionNo?: string
  dob?: string
  gender?: string
  examName?: string
  session?: string
}> = ({
  isHidden,
  customLabels = {},
  primary,
  fatherName,
  motherName,
  className,
  section,
  rollNo,
  admissionNo,
  dob,
  gender,
  examName,
  session
}) => {
  const badges: { label: string; val: string }[] = []
  if (!isHidden('Father Name')) {
    badges.push({ label: 'Father', val: fatherName || customLabels['fatherName'] || 'Shri Rajesh Sharma' })
  }
  if (!isHidden('Mother Name')) {
    badges.push({ label: 'Mother', val: motherName || customLabels['motherName'] || 'Smt. Sunita Sharma' })
  }
  if (!isHidden('Class & Section') && !isHidden('Class')) {
    badges.push({ label: 'Class', val: section ? `${className || 'Class X'} - ${section}` : (className || 'Class X') })
  }
  if (!isHidden('Roll No.') && !isHidden('Roll Number')) {
    badges.push({ label: 'Roll No', val: rollNo || customLabels['rollNo'] || '101' })
  }
  if (!isHidden('Admission No.') && !isHidden('Admission / Reg No.')) {
    badges.push({ label: 'Adm No', val: admissionNo || customLabels['admissionNo'] || 'ADM-2025-042' })
  }
  if (!isHidden('Date of Birth') && !isHidden('DOB')) {
    badges.push({ label: 'DOB', val: dob || customLabels['dob'] || '15/08/2010' })
  }
  if (!isHidden('Gender')) {
    badges.push({ label: 'Gender', val: gender || customLabels['gender'] || 'Male' })
  }
  if (!isHidden('Exam Name') && !isHidden('Exam / Event Name')) {
    badges.push({ label: 'Exam', val: examName || customLabels['examName'] || 'Annual Examination' })
  }
  if (!isHidden('Session') && !isHidden('Academic Session')) {
    badges.push({ label: 'Session', val: session || customLabels['session'] || '2025-2026' })
  }

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 my-1 px-3 py-0.5 rounded-full bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 max-w-2xl text-[9.5px] text-slate-700 dark:text-slate-200 shadow-2xs font-sans">
      {badges.map((b, i) => (
        <span key={b.label} className="inline-flex items-center gap-1 font-semibold">
          <span className="text-[8.5px] uppercase font-bold text-slate-400">{b.label}:</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">{b.val}</span>
          {i < badges.length - 1 && <span className="text-slate-300 dark:text-slate-600 ml-1">•</span>}
        </span>
      ))}
    </div>
  )
}// Shared Student Candidate Photo Badge
export const CertificateCandidatePhoto: React.FC<{
  studentPhoto?: string
  isHidden: (field: string) => boolean
  top?: string
  left?: string
}> = ({ studentPhoto, isHidden, top = 'top-7', left = 'left-10' }) => {
  if (isHidden('Student Photo') || isHidden('Photo')) return null
  return (
    <div className={`absolute ${top} ${left} z-30 flex flex-col items-center bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm pointer-events-none`}>
      <div className="w-11 h-13 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
        {studentPhoto ? (
          <img src={studentPhoto} alt="Student" className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-slate-400" />
        )}
      </div>
      <span className="text-[6.5px] font-black text-slate-400 uppercase mt-0.5 tracking-wider">Candidate</span>
    </div>
  )
}

// Shared Comprehensive Footer Signatures & Official Seal
export const CertificateFooterSignatures: React.FC<{
  primary: string
  primaryDark?: string
  date?: string
  editable?: boolean
  isHidden: (field: string) => boolean
  customLabels: Record<string, string>
  showSeal?: boolean
  sealComponent?: React.ReactNode
  principalName?: string
  principalLabel?: string
  teacherSignName?: string
  teacherSignLabel?: string
  controllerSignName?: string
  controllerSignLabel?: string
  parentSignName?: string
  parentSignLabel?: string
  secondarySignName?: string
  secondarySignLabel?: string
  studentSignLabel?: string
  onUpdateField?: (field: string, value: string) => void
  onUpdateLabel?: (key: string, value: string) => void
  fontFamily?: string
}> = ({
  primary,
  primaryDark,
  date,
  editable,
  isHidden,
  customLabels,
  showSeal = true,
  sealComponent,
  principalName,
  principalLabel,
  teacherSignName,
  teacherSignLabel,
  controllerSignName,
  controllerSignLabel,
  parentSignName,
  parentSignLabel,
  secondarySignName,
  secondarySignLabel,
  studentSignLabel,
  onUpdateField,
  onUpdateLabel,
  fontFamily
}) => {
  const textColor = primaryDark || primary
  const fontStyle = fontFamily ? { fontFamily } : {}

  // Collect all potential signature candidates
  interface SignConfig {
    id: string
    isActive: boolean
    name: string
    label: string
    saveField?: string
    saveLabel: string
    isStudent?: boolean
    isPrincipal?: boolean
  }

  const allSignatures: SignConfig[] = [
    {
      id: 'teacherSign',
      isActive: !isHidden('Teacher Sign') && !isHidden('Class Teacher Sign'),
      name: teacherSignName || customLabels['teacherSignName'] || 'Mrs. Kavita Verma',
      label: teacherSignLabel || customLabels['teacherSignLabel'] || "Class Teacher's Sign",
      saveField: 'teacherSignName',
      saveLabel: 'teacherSign'
    },
    {
      id: 'controllerSign',
      isActive: !isHidden('Controller Sign') && !isHidden('Exam Controller Sign'),
      name: controllerSignName || customLabels['controllerSignName'] || 'Mr. R. K. Saxena',
      label: controllerSignLabel || customLabels['controllerSignLabel'] || 'Exam Controller',
      saveField: 'controllerSignName',
      saveLabel: 'controllerSign'
    },
    {
      id: 'secondarySign',
      isActive: !isHidden('Secondary Sign') && !isHidden('Coordinator Sign') && !isHidden('Coordinator / In-Charge Sign'),
      name: secondarySignName || customLabels['secondarySignName'] || 'Authorized Signatory',
      label: secondarySignLabel || customLabels['secondarySignLabel'] || 'Coordinator / In-Charge',
      saveField: 'secondarySignName',
      saveLabel: 'secondarySign'
    },
    {
      id: 'parentSign',
      isActive: !isHidden('Parent Sign') && !isHidden('Parent / Guardian Sign'),
      name: parentSignName || customLabels['parentSignName'] || 'Parent / Guardian',
      label: parentSignLabel || customLabels['parentSignLabel'] || "Parent's Signature",
      saveField: 'parentSignName',
      saveLabel: 'parentSign'
    },
    {
      id: 'studentSign',
      isActive: !isHidden('Student Sign') && !isHidden('Student Signature Line'),
      name: 'Candidate',
      label: studentSignLabel || customLabels['studentSignLabel'] || "Student's Signature",
      saveLabel: 'studentSign',
      isStudent: true
    },
    {
      id: 'principalSign',
      isActive: !isHidden('Principal Sign') && !isHidden('Principal / Director Sign'),
      name: principalName || customLabels['principalName'] || 'Dr. S. K. Sharma',
      label: principalLabel || customLabels['principalSignLabel'] || 'Principal & Director',
      saveField: 'principalName',
      saveLabel: 'principalSign',
      isPrincipal: true
    }
  ]

  // Filter to active signatures (up to 4 active)
  const activeSigns = allSignatures.filter(s => s.isActive)

  // Ensure Principal is positioned on the far right if active
  const sortedSigns = [...activeSigns].sort((a, b) => {
    if (a.isPrincipal) return 1
    if (b.isPrincipal) return -1
    return 0
  })

  const isSealVisible = !!showSeal && !isHidden('Official Seal') && !isHidden('Seal') && !isHidden('School Stamp') && !isHidden('Official Seal / Crest')
  const isDateVisible = !isHidden('Certificate Date') && !isHidden('Date of Issue')

  // Render helper for an individual signature box
  const renderSignBox = (s: SignConfig) => (
    <div key={s.id} className="flex flex-col items-center flex-1 min-w-[80px] max-w-[135px] text-center px-1 mb-1">
      {s.isStudent ? (
        <p className="italic font-bold text-xs mb-0.5 text-slate-400 truncate w-full" style={fontStyle}>
          Candidate
        </p>
      ) : (
        <LiveEditableText
          tag="p"
          value={s.name}
          editable={editable && !!s.saveField}
          onSave={(val) => s.saveField && onUpdateField?.(s.saveField, val)}
          className={`italic font-bold text-xs mb-0.5 truncate w-full ${s.id === 'parentSign' ? 'text-slate-600' : ''}`}
          style={{ color: s.id === 'parentSign' ? undefined : textColor, ...fontStyle }}
        />
      )}
      <div className="w-full h-px bg-slate-300 mb-0.5" />
      <LiveEditableText
        tag="p"
        value={s.label}
        editable={editable}
        onSave={(val) => onUpdateLabel?.(s.saveLabel, val)}
        className="text-[7.5px] font-bold text-slate-400 tracking-widest uppercase truncate max-w-full"
      />
    </div>
  )

  // Split signatures around central seal if seal is visible
  let leftSigns: SignConfig[] = []
  let rightSigns: SignConfig[] = []

  if (isSealVisible) {
    if (sortedSigns.length === 4) {
      leftSigns = sortedSigns.slice(0, 2)
      rightSigns = sortedSigns.slice(2, 4)
    } else if (sortedSigns.length === 3) {
      leftSigns = sortedSigns.slice(0, 2)
      rightSigns = sortedSigns.slice(2, 3)
    } else if (sortedSigns.length === 2) {
      leftSigns = sortedSigns.slice(0, 1)
      rightSigns = sortedSigns.slice(1, 2)
    } else if (sortedSigns.length === 1) {
      leftSigns = []
      rightSigns = sortedSigns
    }
  }

  return (
    <div className="relative z-20 flex flex-col justify-end px-10 pb-5 mt-auto gap-2 w-full">
      {/* Signatures & Central Seal Row */}
      <div className="flex justify-between items-end gap-3 w-full">
        {isSealVisible ? (
          <>
            {/* Left Wing Signatures */}
            <div className="flex items-end gap-3 flex-1 justify-start">
              {leftSigns.map(renderSignBox)}
            </div>

            {/* Central Official Seal / Crest */}
            <div className="shrink-0 flex items-center justify-center w-20 h-22 mx-2">
              {sealComponent}
            </div>

            {/* Right Wing Signatures */}
            <div className="flex items-end gap-3 flex-1 justify-end">
              {rightSigns.map(renderSignBox)}
            </div>
          </>
        ) : (
          /* Full Width Distributed Signatures when Seal is OFF */
          <div className="flex justify-between items-end gap-4 w-full">
            {sortedSigns.map(renderSignBox)}
          </div>
        )}
      </div>

      {/* Date of Issue Badge (Cleanly placed at footer bottom-left, never displacing signatures) */}
      {isDateVisible && (
        <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-500 pt-0.5 border-t border-slate-100/60 dark:border-slate-800/40">
          <span className="uppercase tracking-widest text-slate-400 font-extrabold">{customLabels['date_label'] || 'Date of Issue'}:</span>
          <LiveEditableText
            tag="span"
            value={date || '15 October 2026'}
            editable={editable}
            onSave={(val) => onUpdateField?.('date', val)}
            className="font-bold text-slate-700 dark:text-slate-300"
          />
        </div>
      )}
    </div>
  )
}


// -------------------------------------------------------------
// DESIGN 1: BLUE & GOLD ROYAL GEOMETRIC (PORTRAIT/LANDSCAPE)
// -------------------------------------------------------------
export const CertificateDesign1: React.FC<CertificateCustomProps> = ({
  title = 'CERTIFICATE OF ACHIEVEMENT',
  subtitle = 'In Recognition of Academic Excellence',
  presentedTo,
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolLogo,
  logoWidth = 60,
  showLogo = true,
  schoolNameFontSize,
  titleFontSize,
  subtitleFontSize,
  studentName = 'Student Name',
  fatherName,
  motherName,
  admissionNo,
  rollNo,
  className,
  section,
  dob,
  gender,
  studentPhoto,
  examName,
  session,
  content = 'This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session.',
  date = '15 October 2025',
  awarder = 'Principal & Director',
  principalName,
  principalLabel,
  teacherSignName,
  teacherSignLabel,
  controllerSignName,
  controllerSignLabel,
  parentSignName,
  parentSignLabel,
  secondarySignName,
  secondarySignLabel,
  studentSignLabel,
  showQr = true,
  showSeal = true,
  hiddenFields = [],
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)
  const primary = themeColor || '#1e3a8a'
  const borderTint = hexToRgba(primary, 0.25)
  const effectivePrincipalName = principalName || 'Dr. S. K. Sharma'
  const effectivePrincipalLabel = principalLabel || awarder || 'Principal & Director'
  const effectiveSecondaryName = secondarySignName || customLabels['secondarySignName'] || 'Authorized Signatory'
  const effectiveSecondaryLabel = secondarySignLabel || customLabels['secondarySignLabel'] || 'Coordinator / In-Charge'
  const actualLogoWidth = Math.max(28, Math.min(180, Number(logoWidth) || 60))

  return (
    <div className="w-[800px] h-[580px] bg-white relative overflow-hidden flex flex-col font-sans shrink-0 border border-slate-300 shadow-2xl select-none text-slate-800">
      {/* Decorative Gold & Primary Corner Accents (Proportionate size so they NEVER cut photo, QR, or signatures) */}
      <div className="absolute top-0 left-0 w-24 h-24 -translate-x-12 -translate-y-12 rotate-45 flex flex-col z-0 pointer-events-none">
        <div className="w-full h-3 bg-amber-400"></div>
        <div className="w-full h-1 bg-white"></div>
        <div className="w-full h-8" style={{ backgroundColor: primary }}></div>
      </div>
      <div className="absolute bottom-0 right-0 w-24 h-24 translate-x-12 translate-y-12 rotate-45 flex flex-col z-0 pointer-events-none">
        <div className="w-full h-8" style={{ backgroundColor: primary }}></div>
        <div className="w-full h-1 bg-white"></div>
        <div className="w-full h-3 bg-amber-400"></div>
      </div>

      {/* Thin Gold Frame */}
      <div className="absolute inset-4 border-2 border-amber-400/70 z-0 rounded-xs pointer-events-none"></div>
      <div className="absolute inset-6 border z-0 rounded-2xs pointer-events-none" style={{ borderColor: borderTint }}></div>

      {/* Watermark */}
      {!isHidden('Water Mark') && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
          <Award className="w-96 h-96" style={{ color: primary }} />
        </div>
      )}

      {/* QR Code */}
      {showQr && !isHidden('QR Code') && (
        <div className="absolute top-7 right-10 z-30 flex flex-col items-center bg-white p-1 rounded border border-slate-200 shadow-2xs">
          <ProperQrCode className="w-11 h-11" color={primary} />
          <span className="text-[6.5px] font-mono text-slate-400 mt-0.5">VERIFIED</span>
        </div>
      )}

      {/* Student Candidate Photo */}
      <CertificateCandidatePhoto studentPhoto={studentPhoto} isHidden={isHidden} top="top-7" left="left-10" />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col items-center pt-6 px-16 text-center flex-1 justify-center">
        {showLogo && !isHidden('Logo') && !isHidden('Institute Logo') && (
          <div 
            onClick={() => {
              if (editable) onUpdateField?.('triggerLogoUpload', 'true')
            }}
            title={editable ? 'Click to select / upload institute logo' : undefined}
            className={`mb-1.5 shrink-0 flex items-center justify-center relative group overflow-hidden ${
              editable ? 'cursor-pointer hover:ring-2 hover:ring-amber-500 rounded-xl transition-all' : ''
            }`}
            style={{ width: `${actualLogoWidth}px`, height: `${actualLogoWidth}px` }}
          >
            {schoolLogo ? (
              <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <SampleSchoolLogo width={actualLogoWidth} height={actualLogoWidth} color={primary} />
            )}
            {editable && (
              <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center text-[7.5px] font-black transition-opacity">
                <Upload className="w-3.5 h-3.5 mb-0.5" />
                <span>Change</span>
              </div>
            )}
          </div>
        )}
        {!isHidden('School Name') && (
          <LiveEditableText
            tag="h4"
            value={schoolName}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolName', val)}
            className="font-serif font-black text-sm tracking-widest uppercase mb-0.5"
            style={{ 
              color: primary,
              fontSize: parseFontSize(schoolNameFontSize) || undefined 
            }}
            fontSizeControl={{
              label: 'Institute Name',
              value: schoolNameFontSize ? parseInt(String(schoolNameFontSize)) : 14,
              onChange: (val) => onUpdateField?.('schoolNameFontSize', val)
            }}
          />
        )}
        {!isHidden('School Address') && schoolAddress && (
          <LiveEditableText
            tag="p"
            value={schoolAddress}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolAddress', val)}
            className="text-[9px] text-slate-500 font-sans tracking-wide mb-1 max-w-lg truncate"
          />
        )}

        {/* Certificate Title */}
        {!isHidden('Title') && (
          <div className="mb-1">
            <LiveEditableText
              tag="h1"
              value={title}
              editable={editable}
              onSave={(val) => onUpdateField?.('title', val)}
              className="font-serif font-black text-3xl tracking-wider text-slate-900 uppercase drop-shadow-xs"
              style={{ 
                fontSize: parseFontSize(titleFontSize) || undefined 
              }}
              fontSizeControl={{
                label: 'Certificate Title',
                value: titleFontSize ? parseInt(String(titleFontSize)) : 30,
                onChange: (val) => onUpdateField?.('titleFontSize', val)
              }}
            />
            {!isHidden('Subtitle') && !isHidden('Tagline') && (
              <LiveEditableText
                tag="p"
                value={subtitle}
                editable={editable}
                onSave={(val) => onUpdateField?.('subtitle', val)}
                className="font-bold text-[11px] tracking-[0.25em] uppercase mt-0.5"
                style={{ 
                  color: primary,
                  fontSize: parseFontSize(subtitleFontSize) || undefined 
                }}
                fontSizeControl={{
                  label: 'Subtitle',
                  value: subtitleFontSize ? parseInt(String(subtitleFontSize)) : 11,
                  onChange: (val) => onUpdateField?.('subtitleFontSize', val)
                }}
              />
            )}
          </div>
        )}

        <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent my-2"></div>

        {!isHidden('Presented To') && (
          <div className="mb-1">
            <LiveEditableText
              tag="p"
              value={presentedTo || customLabels['presented_to'] || 'This Certificate is Proudly Presented To'}
              editable={editable}
              onSave={(val) => onUpdateLabel?.('presented_to', val)}
              className="text-[10px] tracking-widest text-slate-500 font-semibold uppercase"
            />
          </div>
        )}

        {/* Student Name */}
        {!isHidden('Student Name') && (
          <div className="my-0.5">
            <LiveEditableText
              tag="h3"
              value={studentName}
              editable={editable}
              onSave={(val) => onUpdateField?.('studentName', val)}
              className="font-serif font-black text-3xl tracking-wide border-b-2 border-amber-400/80 px-8 pb-0.5 inline-block"
              style={{ color: primary }}
            />
          </div>
        )}

        {/* Student Academic & Personal Metadata Badges */}
        <CertificateStudentMetadata
          fatherName={fatherName}
          motherName={motherName}
          className={className}
          section={section}
          rollNo={rollNo}
          admissionNo={admissionNo}
          dob={dob}
          gender={gender}
          examName={examName}
          session={session}
          isHidden={isHidden}
          primary={primary}
        />

        {/* Description / Content */}
        {!isHidden('Description') && (
          <div className="max-w-xl mx-auto mt-2 px-6">
            <LiveEditableText
              tag="p"
              multiline
              value={content}
              editable={editable}
              onSave={(val) => onUpdateField?.('content', val)}
              className="text-slate-600 text-[11.5px] font-medium leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Comprehensive Footer Signatures & Official Seal */}
      <CertificateFooterSignatures
        primary={primary}
        date={date}
        editable={editable}
        isHidden={isHidden}
        customLabels={customLabels}
        showSeal={showSeal}
        sealComponent={<GoldSeal text={customLabels['seal_label'] || "ACADEMIC EXCELLENCE"} ribbonColor={primary} />}
        principalName={effectivePrincipalName}
        principalLabel={effectivePrincipalLabel}
        teacherSignName={teacherSignName}
        teacherSignLabel={teacherSignLabel}
        controllerSignName={controllerSignName}
        controllerSignLabel={controllerSignLabel}
        parentSignName={parentSignName}
        parentSignLabel={parentSignLabel}
        secondarySignName={effectiveSecondaryName}
        secondarySignLabel={effectiveSecondaryLabel}
        studentSignLabel={studentSignLabel}
        onUpdateField={onUpdateField}
        onUpdateLabel={onUpdateLabel}
      />
    </div>
  )
}

// -------------------------------------------------------------
// DESIGN 2: CLASSIC ORNATE VINTAGE GOLD
// -------------------------------------------------------------
export const CertificateDesign2: React.FC<CertificateCustomProps> = ({
  title = 'CERTIFICATE OF MERIT',
  subtitle = 'For Demonstrating High Excellence',
  presentedTo,
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolLogo,
  logoWidth = 60,
  showLogo = true,
  schoolNameFontSize,
  titleFontSize,
  subtitleFontSize,
  studentName = 'Student Name',
  fatherName,
  motherName,
  admissionNo,
  rollNo,
  className,
  section,
  dob,
  gender,
  studentPhoto,
  examName,
  session,
  content = 'This certificate is conferred in recognition of exceptional scholarly merit, consistent diligence, and exemplary conduct shown throughout the academic term.',
  date = '15 October 2025',
  awarder = 'Principal / Head of Institution',
  principalName,
  principalLabel,
  teacherSignName,
  teacherSignLabel,
  controllerSignName,
  controllerSignLabel,
  parentSignName,
  parentSignLabel,
  secondarySignName,
  secondarySignLabel,
  studentSignLabel,
  showQr = true,
  showSeal = true,
  hiddenFields = [],
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)
  const primary = themeColor || '#b08d55'
  const primaryDark = adjustHex(primary, -25)
  const primaryLight = hexToRgba(primary, 0.12)
  const effectivePrincipalName = principalName || 'Authorized Signatory'
  const effectivePrincipalLabel = principalLabel || awarder || 'Head of Institution'
  const effectiveSecondaryName = secondarySignName || customLabels['secondarySignName'] || 'Authorized Signatory'
  const effectiveSecondaryLabel = secondarySignLabel || customLabels['secondarySignLabel'] || 'Coordinator / In-Charge'
  const actualLogoWidth = Math.max(28, Math.min(180, Number(logoWidth) || 60))

  const vintageSeal = (
    <div 
      className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center flex-col relative shadow-inner"
      style={{ 
        borderColor: primary, 
        color: primary,
        backgroundColor: primaryLight
      }}
    >
      {customLabels['seal_label'] ? (
        <span className="font-bold text-[8px] text-center uppercase tracking-wider px-1 leading-tight">{customLabels['seal_label']}</span>
      ) : (
        <>
          <span className="text-[7.5px]">★★★</span>
          <span className="font-bold text-[8.5px] text-center leading-tight">MERIT<br/>AWARD</span>
          <span className="text-[7.5px]">★★★</span>
        </>
      )}
    </div>
  )

  return (
    <div className="w-[800px] h-[580px] bg-[#faf8f2] relative overflow-hidden flex flex-col font-serif shrink-0 border-[14px] border-white shadow-2xl select-none text-slate-800">
      {/* Ornate Gold Border */}
      <div 
        className="absolute inset-3 border-[2.5px] flex z-10 pointer-events-none"
        style={{ borderColor: primary }}
      >
        <div className="absolute -top-3.5 -left-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-2xl" style={{ color: primary }}>⚜</div>
        <div className="absolute -top-3.5 -right-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-2xl" style={{ color: primary }}>⚜</div>
        <div className="absolute -bottom-3.5 -left-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-2xl" style={{ color: primary }}>⚜</div>
        <div className="absolute -bottom-3.5 -right-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-2xl" style={{ color: primary }}>⚜</div>
      </div>

      {/* QR Code */}
      {showQr && !isHidden('QR Code') && (
        <div className="absolute top-7 right-10 z-30 flex flex-col items-center bg-white p-1 rounded border border-amber-300 shadow-2xs">
          <ProperQrCode className="w-11 h-11" color={primary} />
          <span className="text-[6.5px] font-mono text-slate-400 mt-0.5">VERIFIED</span>
        </div>
      )}

      {/* Candidate Photo */}
      <CertificateCandidatePhoto studentPhoto={studentPhoto} isHidden={isHidden} top="top-7" left="left-10" />

      <div className="relative z-20 flex flex-col items-center pt-6 px-16 flex-1 text-center justify-center">
        {showLogo && !isHidden('Logo') && !isHidden('Institute Logo') && (
          <div 
            onClick={() => {
              if (editable) onUpdateField?.('triggerLogoUpload', 'true')
            }}
            title={editable ? 'Click to select / upload institute logo' : undefined}
            className={`mb-1.5 shrink-0 flex items-center justify-center relative group overflow-hidden ${
              editable ? 'cursor-pointer hover:ring-2 hover:ring-amber-500 rounded-xl transition-all' : ''
            }`}
            style={{ width: `${actualLogoWidth}px`, height: `${actualLogoWidth}px` }}
          >
            {schoolLogo ? (
              <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <SampleSchoolLogo width={actualLogoWidth} height={actualLogoWidth} color={primaryDark} />
            )}
            {editable && (
              <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center text-[7.5px] font-black transition-opacity">
                <Upload className="w-3.5 h-3.5 mb-0.5" />
                <span>Change</span>
              </div>
            )}
          </div>
        )}
        {!isHidden('School Name') && (
          <LiveEditableText
            tag="h4"
            value={schoolName}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolName', val)}
            className="font-serif font-black text-xs tracking-widest uppercase mb-1"
            style={{ 
              color: primaryDark,
              fontSize: parseFontSize(schoolNameFontSize) || undefined 
            }}
            fontSizeControl={{
              label: 'Institute Name',
              value: schoolNameFontSize ? parseInt(String(schoolNameFontSize)) : 14,
              onChange: (val) => onUpdateField?.('schoolNameFontSize', val)
            }}
          />
        )}
        {!isHidden('School Address') && schoolAddress && (
          <LiveEditableText
            tag="p"
            value={schoolAddress}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolAddress', val)}
            className="text-[9px] text-slate-500 font-sans tracking-wide mb-1 max-w-lg truncate"
          />
        )}

        {/* Certificate Title */}
        {!isHidden('Title') && (
          <div className="mb-0.5">
            <LiveEditableText
              tag="h1"
              value={title}
              editable={editable}
              onSave={(val) => onUpdateField?.('title', val)}
              className="font-black text-3xl tracking-wider text-slate-900 uppercase"
              style={{ 
                fontSize: parseFontSize(titleFontSize) || undefined 
              }}
              fontSizeControl={{
                label: 'Certificate Title',
                value: titleFontSize ? parseInt(String(titleFontSize)) : 30,
                onChange: (val) => onUpdateField?.('titleFontSize', val)
              }}
            />
            {!isHidden('Subtitle') && !isHidden('Tagline') && (
              <div className="flex items-center justify-center gap-3 text-slate-600 mt-0.5">
                <div className="w-10 h-px" style={{ backgroundColor: primary }}></div>
                <LiveEditableText
                  tag="h2"
                  value={subtitle}
                  editable={editable}
                  onSave={(val) => onUpdateField?.('subtitle', val)}
                  className="tracking-[0.2em] font-medium text-[11px] uppercase"
                  style={{ 
                    color: primaryDark,
                    fontSize: parseFontSize(subtitleFontSize) || undefined 
                  }}
                  fontSizeControl={{
                    label: 'Subtitle',
                    value: subtitleFontSize ? parseInt(String(subtitleFontSize)) : 11,
                    onChange: (val) => onUpdateField?.('subtitleFontSize', val)
                  }}
                />
                <div className="w-10 h-px" style={{ backgroundColor: primary }}></div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-1.5 my-1.5 text-xs" style={{ color: primary }}>
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>

        {!isHidden('Presented To') && (
          <div className="mb-1">
            <LiveEditableText
              tag="p"
              value={presentedTo || customLabels['presented_to'] || 'This Honor is Bestowed Upon'}
              editable={editable}
              onSave={(val) => onUpdateLabel?.('presented_to', val)}
              className="text-[10px] tracking-widest text-slate-500 font-bold uppercase font-sans"
            />
          </div>
        )}

        {/* Student Name */}
        {!isHidden('Student Name') && (
          <LiveEditableText
            tag="h3"
            value={studentName}
            editable={editable}
            onSave={(val) => onUpdateField?.('studentName', val)}
            className="text-4xl mb-1 font-medium tracking-wide"
            style={{ fontFamily: 'Georgia, serif', color: primaryDark }}
          />
        )}

        {/* Student Metadata */}
        <CertificateStudentMetadata
          fatherName={fatherName}
          motherName={motherName}
          className={className}
          section={section}
          rollNo={rollNo}
          admissionNo={admissionNo}
          dob={dob}
          gender={gender}
          examName={examName}
          session={session}
          isHidden={isHidden}
          primary={primaryDark}
        />

        <div className="w-full max-w-xs mx-auto flex items-center gap-2 my-1.5" style={{ color: primary }}>
          <span className="text-xs">♦</span>
          <div className="flex-1 h-px" style={{ backgroundColor: primary }}></div>
          <span className="text-xs">♦</span>
        </div>

        {/* Description */}
        {!isHidden('Description') && (
          <div className="max-w-xl px-6 font-sans">
            <LiveEditableText
              tag="p"
              multiline
              value={content}
              editable={editable}
              onSave={(val) => onUpdateField?.('content', val)}
              className="text-[11.5px] text-slate-600 leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Comprehensive Footer Signatures & Official Seal */}
      <CertificateFooterSignatures
        primary={primary}
        primaryDark={primaryDark}
        date={date}
        editable={editable}
        isHidden={isHidden}
        customLabels={customLabels}
        showSeal={showSeal}
        sealComponent={vintageSeal}
        fontFamily="cursive"
        principalName={effectivePrincipalName}
        principalLabel={effectivePrincipalLabel}
        teacherSignName={teacherSignName}
        teacherSignLabel={teacherSignLabel}
        controllerSignName={controllerSignName}
        controllerSignLabel={controllerSignLabel}
        parentSignName={parentSignName}
        parentSignLabel={parentSignLabel}
        secondarySignName={effectiveSecondaryName}
        secondarySignLabel={effectiveSecondaryLabel}
        studentSignLabel={studentSignLabel}
        onUpdateField={onUpdateField}
        onUpdateLabel={onUpdateLabel}
      />
    </div>
  )
}

// -------------------------------------------------------------
// DESIGN 3: MODERN LUXURY MINIMALIST (EMERALD & GOLD)
// -------------------------------------------------------------
export const CertificateDesign3: React.FC<CertificateCustomProps> = ({
  title = 'CERTIFICATE OF EXCELLENCE',
  subtitle = 'Excellence in Extracurricular & Sports',
  presentedTo,
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolLogo,
  logoWidth = 60,
  showLogo = true,
  schoolNameFontSize,
  titleFontSize,
  subtitleFontSize,
  studentName = 'Student Name',
  fatherName,
  motherName,
  admissionNo,
  rollNo,
  className,
  section,
  dob,
  gender,
  studentPhoto,
  examName,
  session,
  content = 'Presented in high honor and appreciation for exceptional sportsmanship, energetic teamwork, and exemplary performance representing the institution with pride.',
  date = '15 October 2025',
  awarder = 'Principal & Sports Council',
  principalName,
  principalLabel,
  teacherSignName,
  teacherSignLabel,
  controllerSignName,
  controllerSignLabel,
  parentSignName,
  parentSignLabel,
  secondarySignName,
  secondarySignLabel,
  studentSignLabel,
  showQr = true,
  showSeal = true,
  hiddenFields = [],
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)
  const primary = themeColor || '#065f46'
  const primaryDark = adjustHex(primary, -25)
  const primaryLight = hexToRgba(primary, 0.12)
  const effectivePrincipalName = principalName || 'Director.Admin'
  const effectivePrincipalLabel = principalLabel || awarder || 'Principal & Sports Council'
  const effectiveSecondaryName = secondarySignName || customLabels['secondarySignName'] || 'Authorized Signatory'
  const effectiveSecondaryLabel = secondarySignLabel || customLabels['secondarySignLabel'] || 'Coordinator / In-Charge'
  const actualLogoWidth = Math.max(28, Math.min(180, Number(logoWidth) || 60))

  const emeraldSeal = (
    <div className="flex flex-col items-center">
      <div 
        className="w-13 h-13 rounded-full border-2 flex items-center justify-center shadow-xs"
        style={{ 
          borderColor: primary, 
          backgroundColor: primaryLight,
          color: primary 
        }}
      >
        <ShieldCheck className="w-6 h-6" style={{ color: primary }} />
      </div>
      <span className="text-[7.5px] font-bold uppercase tracking-wider mt-0.5" style={{ color: primaryDark }}>
        {customLabels['seal_label'] || 'Verified'}
      </span>
    </div>
  )

  return (
    <div 
      className="w-[800px] h-[580px] bg-white relative overflow-hidden flex flex-col font-sans shrink-0 shadow-2xl select-none text-slate-800"
      style={{ border: `10px solid ${primary}` }}
    >
      {/* Decorative Gold & Primary Accent Bars */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-400 to-amber-200 opacity-20 rounded-bl-full pointer-events-none"></div>
      <div 
        className="absolute bottom-0 left-0 w-32 h-32 opacity-15 rounded-tr-full pointer-events-none"
        style={{ background: `linear-gradient(to top right, ${primary}, #38bdf8)` }}
      ></div>

      <div className="absolute inset-4 border pointer-events-none" style={{ borderColor: hexToRgba(primary, 0.25) }}></div>

      {showQr && !isHidden('QR Code') && (
        <div 
          className="absolute top-7 right-8 z-30 p-1 rounded-lg border shadow-2xs bg-white"
          style={{ borderColor: hexToRgba(primary, 0.3) }}
        >
          <ProperQrCode className="w-11 h-11" color={primary} />
          <span className="text-[6.5px] font-mono text-slate-400 mt-0.5 block text-center">VERIFIED</span>
        </div>
      )}

      {/* Candidate Photo */}
      <CertificateCandidatePhoto studentPhoto={studentPhoto} isHidden={isHidden} top="top-7" left="left-8" />

      <div className="relative z-10 flex flex-col items-center pt-6 px-16 flex-1 text-center justify-center">
        {showLogo && !isHidden('Logo') && !isHidden('Institute Logo') && (
          <div 
            onClick={() => {
              if (editable) onUpdateField?.('triggerLogoUpload', 'true')
            }}
            title={editable ? 'Click to select / upload institute logo' : undefined}
            className={`mb-1.5 shrink-0 flex items-center justify-center relative group overflow-hidden ${
              editable ? 'cursor-pointer hover:ring-2 hover:ring-amber-500 rounded-xl transition-all' : ''
            }`}
            style={{ width: `${actualLogoWidth}px`, height: `${actualLogoWidth}px` }}
          >
            {schoolLogo ? (
              <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <SampleSchoolLogo width={actualLogoWidth} height={actualLogoWidth} color={primary} />
            )}
            {editable && (
              <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center text-[7.5px] font-black transition-opacity">
                <Upload className="w-3.5 h-3.5 mb-0.5" />
                <span>Change</span>
              </div>
            )}
          </div>
        )}
        {!isHidden('School Name') && (
          <div className="flex items-center gap-2 mb-1">
            {!showLogo && (
              <div 
                className="w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[10px]"
                style={{ backgroundColor: primary }}
              >
                <Award className="w-3.5 h-3.5" />
              </div>
            )}
            <LiveEditableText
              tag="h4"
              value={schoolName}
              editable={editable}
              onSave={(val) => onUpdateField?.('schoolName', val)}
              className="font-bold text-xs tracking-widest uppercase"
              style={{ 
                color: primaryDark,
                fontSize: parseFontSize(schoolNameFontSize) || undefined 
              }}
              fontSizeControl={{
                label: 'Institute Name',
                value: schoolNameFontSize ? parseInt(String(schoolNameFontSize)) : 14,
                onChange: (val) => onUpdateField?.('schoolNameFontSize', val)
              }}
            />
          </div>
        )}
        {!isHidden('School Address') && schoolAddress && (
          <LiveEditableText
            tag="p"
            value={schoolAddress}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolAddress', val)}
            className="text-[9px] text-slate-500 font-sans tracking-wide mb-1 max-w-lg truncate"
          />
        )}

        {!isHidden('Title') && (
          <div className="mb-1">
            <LiveEditableText
              tag="h1"
              value={title}
              editable={editable}
              onSave={(val) => onUpdateField?.('title', val)}
              className="font-serif font-black text-3xl tracking-wider uppercase text-slate-900"
              style={{ 
                fontSize: parseFontSize(titleFontSize) || undefined 
              }}
              fontSizeControl={{
                label: 'Certificate Title',
                value: titleFontSize ? parseInt(String(titleFontSize)) : 30,
                onChange: (val) => onUpdateField?.('titleFontSize', val)
              }}
            />
            {!isHidden('Subtitle') && !isHidden('Tagline') && (
              <LiveEditableText
                tag="p"
                value={subtitle}
                editable={editable}
                onSave={(val) => onUpdateField?.('subtitle', val)}
                className="font-bold text-[11px] tracking-[0.25em] uppercase mt-0.5"
                style={{ 
                  color: primary,
                  fontSize: parseFontSize(subtitleFontSize) || undefined 
                }}
                fontSizeControl={{
                  label: 'Subtitle',
                  value: subtitleFontSize ? parseInt(String(subtitleFontSize)) : 11,
                  onChange: (val) => onUpdateField?.('subtitleFontSize', val)
                }}
              />
            )}
          </div>
        )}

        <div 
          className="w-24 h-1 rounded-full my-1.5"
          style={{ background: `linear-gradient(to right, ${primary}, #f59e0b)` }}
        ></div>

        {!isHidden('Presented To') && (
          <div className="mb-1">
            <LiveEditableText
              tag="p"
              value={presentedTo || customLabels['presented_to'] || 'This Distinction is Bestowed Upon'}
              editable={editable}
              onSave={(val) => onUpdateLabel?.('presented_to', val)}
              className="text-[10px] tracking-widest text-slate-500 font-bold uppercase"
            />
          </div>
        )}

        {!isHidden('Student Name') && (
          <LiveEditableText
            tag="h3"
            value={studentName}
            editable={editable}
            onSave={(val) => onUpdateField?.('studentName', val)}
            className="font-serif font-black text-3xl tracking-wide border-b-2 px-8 pb-0.5 inline-block my-0.5"
            style={{ color: primaryDark, borderColor: primary }}
          />
        )}

        {/* Student Metadata Badges */}
        <CertificateStudentMetadata
          fatherName={fatherName}
          motherName={motherName}
          className={className}
          section={section}
          rollNo={rollNo}
          admissionNo={admissionNo}
          dob={dob}
          gender={gender}
          examName={examName}
          session={session}
          isHidden={isHidden}
          primary={primaryDark}
        />

        {!isHidden('Description') && (
          <div className="max-w-xl mx-auto mt-2 px-6">
            <LiveEditableText
              tag="p"
              multiline
              value={content}
              editable={editable}
              onSave={(val) => onUpdateField?.('content', val)}
              className="text-slate-600 text-[11.5px] font-medium leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Comprehensive Footer Signatures & Official Seal */}
      <CertificateFooterSignatures
        primary={primary}
        primaryDark={primaryDark}
        date={date}
        editable={editable}
        isHidden={isHidden}
        customLabels={customLabels}
        showSeal={showSeal}
        sealComponent={emeraldSeal}
        principalName={effectivePrincipalName}
        principalLabel={effectivePrincipalLabel}
        teacherSignName={teacherSignName}
        teacherSignLabel={teacherSignLabel}
        controllerSignName={controllerSignName}
        controllerSignLabel={controllerSignLabel}
        parentSignName={parentSignName}
        parentSignLabel={parentSignLabel}
        secondarySignName={effectiveSecondaryName}
        secondarySignLabel={effectiveSecondaryLabel}
        studentSignLabel={studentSignLabel}
        onUpdateField={onUpdateField}
        onUpdateLabel={onUpdateLabel}
      />
    </div>
  )
}

// -------------------------------------------------------------
// DESIGN 4: ELEGANT CORPORATE / ACADEMIC COMPLETION
// -------------------------------------------------------------
export const CertificateDesign4: React.FC<CertificateCustomProps> = ({
  title = 'CERTIFICATE OF COMPLETION',
  subtitle = 'Academic Curriculum & Co-Curricular',
  presentedTo,
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolNameFontSize,
  titleFontSize,
  subtitleFontSize,
  studentName = 'Student Name',
  fatherName,
  motherName,
  admissionNo,
  rollNo,
  className,
  section,
  dob,
  gender,
  studentPhoto,
  examName,
  session,
  content = 'This certifies the satisfactory completion of the prescribed curriculum and active participation in institutional projects with sincere effort and commendable diligence.',
  date = '15 October 2025',
  awarder = 'Principal & Academic Dean',
  principalName,
  principalLabel,
  teacherSignName,
  teacherSignLabel,
  controllerSignName,
  controllerSignLabel,
  parentSignName,
  parentSignLabel,
  secondarySignName,
  secondarySignLabel,
  studentSignLabel,
  showQr = true,
  showSeal = true,
  hiddenFields = [],
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)
  const primary = themeColor || '#1e293b'
  const borderTint = hexToRgba(primary, 0.35)
  const effectivePrincipalName = principalName || 'Dean.Academics'
  const effectivePrincipalLabel = principalLabel || awarder || 'Principal & Academic Dean'
  const effectiveSecondaryName = secondarySignName || customLabels['secondarySignName'] || 'Authorized Signatory'
  const effectiveSecondaryLabel = secondarySignLabel || customLabels['secondarySignLabel'] || 'Coordinator / In-Charge'

  return (
    <div className="w-[800px] h-[580px] bg-white relative overflow-hidden flex flex-col font-sans shrink-0 border border-slate-300 shadow-2xl select-none text-slate-800">
      {/* Sleek Border Frames */}
      <div className="absolute inset-4 border-2 pointer-events-none" style={{ borderColor: primary }}></div>
      <div className="absolute inset-6 border pointer-events-none" style={{ borderColor: borderTint }}></div>

      {showQr && !isHidden('QR Code') && (
        <div className="absolute top-7 right-10 z-30 bg-white p-1 rounded border border-slate-200 shadow-2xs">
          <ProperQrCode className="w-11 h-11" color={primary} />
          <span className="text-[6.5px] font-mono text-slate-400 mt-0.5 block text-center">VERIFIED</span>
        </div>
      )}

      {/* Candidate Photo */}
      <CertificateCandidatePhoto studentPhoto={studentPhoto} isHidden={isHidden} top="top-7" left="left-10" />

      <div className="relative z-10 flex flex-col items-center pt-6 px-16 flex-1 text-center justify-center">
        {!isHidden('School Name') && (
          <LiveEditableText
            tag="h4"
            value={schoolName}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolName', val)}
            className="font-bold text-xs tracking-widest uppercase mb-0.5"
            style={{ 
              color: primary,
              fontSize: parseFontSize(schoolNameFontSize) || undefined 
            }}
            fontSizeControl={{
              label: 'Institute Name',
              value: schoolNameFontSize ? parseInt(String(schoolNameFontSize)) : 14,
              onChange: (val) => onUpdateField?.('schoolNameFontSize', val)
            }}
          />
        )}
        {!isHidden('School Address') && (
          <LiveEditableText
            tag="p"
            value={schoolAddress}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolAddress', val)}
            className="text-[9.5px] text-slate-500 font-medium mb-2"
          />
        )}

        {!isHidden('Title') && (
          <div className="mb-1">
            <LiveEditableText
              tag="h1"
              value={title}
              editable={editable}
              onSave={(val) => onUpdateField?.('title', val)}
              className="font-serif font-black text-3xl tracking-wider text-slate-900 uppercase"
              style={{ 
                fontSize: parseFontSize(titleFontSize) || undefined 
              }}
              fontSizeControl={{
                label: 'Certificate Title',
                value: titleFontSize ? parseInt(String(titleFontSize)) : 30,
                onChange: (val) => onUpdateField?.('titleFontSize', val)
              }}
            />
            {!isHidden('Subtitle') && !isHidden('Tagline') && (
              <LiveEditableText
                tag="p"
                value={subtitle}
                editable={editable}
                onSave={(val) => onUpdateField?.('subtitle', val)}
                className="font-bold text-[11px] tracking-[0.25em] uppercase mt-0.5"
                style={{ 
                  color: primary,
                  fontSize: parseFontSize(subtitleFontSize) || undefined 
                }}
                fontSizeControl={{
                  label: 'Subtitle',
                  value: subtitleFontSize ? parseInt(String(subtitleFontSize)) : 11,
                  onChange: (val) => onUpdateField?.('subtitleFontSize', val)
                }}
              />
            )}
          </div>
        )}

        <div className="w-28 h-0.5 my-1.5" style={{ backgroundColor: primary }}></div>

        {!isHidden('Presented To') && (
          <div className="mb-1">
            <LiveEditableText
              tag="p"
              value={presentedTo || customLabels['presented_to'] || 'This Document Confirms That'}
              editable={editable}
              onSave={(val) => onUpdateLabel?.('presented_to', val)}
              className="text-[10px] tracking-widest text-slate-500 font-semibold uppercase"
            />
          </div>
        )}

        {!isHidden('Student Name') && (
          <LiveEditableText
            tag="h3"
            value={studentName}
            editable={editable}
            onSave={(val) => onUpdateField?.('studentName', val)}
            className="font-serif font-black text-3xl tracking-wide border-b-2 px-8 pb-0.5 inline-block my-0.5"
            style={{ color: primary, borderColor: borderTint }}
          />
        )}

        {/* Student Metadata Badges */}
        <CertificateStudentMetadata
          fatherName={fatherName}
          motherName={motherName}
          className={className}
          section={section}
          rollNo={rollNo}
          admissionNo={admissionNo}
          dob={dob}
          gender={gender}
          examName={examName}
          session={session}
          isHidden={isHidden}
          primary={primary}
        />

        <div className="max-w-xl mx-auto mt-2 px-6">
          <LiveEditableText
            tag="p"
            multiline
            value={content}
            editable={editable}
            onSave={(val) => onUpdateField?.('content', val)}
            className="text-slate-600 text-[11.5px] font-medium leading-relaxed"
          />
        </div>
      </div>

      {/* Comprehensive Footer Signatures & Official Seal */}
      <CertificateFooterSignatures
        primary={primary}
        date={date}
        editable={editable}
        isHidden={isHidden}
        customLabels={customLabels}
        showSeal={showSeal}
        sealComponent={<GoldSeal text={customLabels['seal_label'] || "CERTIFIED"} ribbonColor={primary} />}
        principalName={effectivePrincipalName}
        principalLabel={effectivePrincipalLabel}
        teacherSignName={teacherSignName}
        teacherSignLabel={teacherSignLabel}
        controllerSignName={controllerSignName}
        controllerSignLabel={controllerSignLabel}
        parentSignName={parentSignName}
        parentSignLabel={parentSignLabel}
        secondarySignName={effectiveSecondaryName}
        secondarySignLabel={effectiveSecondaryLabel}
        studentSignLabel={studentSignLabel}
        onUpdateField={onUpdateField}
        onUpdateLabel={onUpdateLabel}
      />
    </div>
  )
}

// -------------------------------------------------------------
// UNIFIED CERTIFICATE PAPER (RESPONSIVE SCALED VIEWPORT)
// -------------------------------------------------------------
export const CertificatePaper: React.FC<CertificateCustomProps & { template?: string; themeColor?: string }> = ({
  template = 'Certificate Design 1',
  themeColor,
  ...props
}) => {
  const tmpl = (template || '').toLowerCase()
  if (tmpl.includes('2')) return <CertificateDesign2 themeColor={themeColor} {...props} />
  if (tmpl.includes('3')) return <CertificateDesign3 themeColor={themeColor} {...props} />
  if (tmpl.includes('4')) return <CertificateDesign4 themeColor={themeColor} {...props} />
  return <CertificateDesign1 themeColor={themeColor} {...props} />
}

// -------------------------------------------------------------
// CERTIFICATE MINI PREVIEW FOR SELECTION CARDS
// -------------------------------------------------------------
export interface CertificateMiniPreviewProps {
  template: 'Certificate Design 1' | 'Certificate Design 2' | 'Certificate Design 3' | 'Certificate Design 4' | string
  themeColor?: string
  schoolName?: string
  schoolLogo?: string
  showLogo?: boolean
  studentName?: string
  title?: string
  subtitle?: string
  date?: string
  isSelected?: boolean
}

export const CertificateMiniPreview: React.FC<CertificateMiniPreviewProps> = ({
  template,
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolLogo,
  showLogo = true,
  studentName = 'Aarav Sharma',
  title,
  subtitle,
  date = '15 Oct 2025',
  isSelected = false
}) => {
  const tmpl = (template || 'Certificate Design 1').toLowerCase()
  const isD2 = tmpl.includes('2') || tmpl.includes('merit') || tmpl.includes('vintage')
  const isD3 = tmpl.includes('3') || tmpl.includes('emerald') || tmpl.includes('sports')
  const isD4 = tmpl.includes('4') || tmpl.includes('completion') || tmpl.includes('academic') || tmpl.includes('corporate')
  const isD1 = !isD2 && !isD3 && !isD4

  const defaultBaseColor = isD2 ? '#b45309' : isD3 ? '#065f46' : isD4 ? '#1e293b' : '#1e3a8a'
  const primary = themeColor || defaultBaseColor
  const tintLight = hexToRgba(primary, 0.08)
  const borderTint = hexToRgba(primary, 0.3)

  return (
    <div
      className={`w-full h-36 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border transition-all duration-300 relative flex flex-col justify-between text-slate-800 dark:text-slate-100 select-none ${
        isSelected
          ? 'shadow-md ring-2 ring-teal-500 scale-[1.01]'
          : 'shadow-2xs hover:shadow-xs'
      }`}
      style={{
        borderColor: isSelected ? primary : borderTint
      }}
    >
      {/* 1. CERTIFICATE DESIGN 1 MINI (ROYAL BLUE GEOMETRIC) */}
      {isD1 && (
        <div className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900 relative overflow-hidden">
          {/* Diagonal Corner Accents */}
          <div
            className="absolute top-0 left-0 w-16 h-16 -translate-x-8 -translate-y-8 rotate-45 pointer-events-none shadow-xs"
            style={{ backgroundColor: primary }}
          />
          <div
            className="absolute bottom-0 right-0 w-16 h-16 translate-x-8 translate-y-8 rotate-45 pointer-events-none shadow-xs"
            style={{ backgroundColor: primary }}
          />
          <div className="absolute top-0 left-0 w-10 h-10 -translate-x-5 -translate-y-5 rotate-45 bg-amber-400 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-10 h-10 translate-x-5 translate-y-5 rotate-45 bg-amber-400 pointer-events-none" />

          {/* Thin Inner Frame */}
          <div className="absolute inset-1.5 border border-amber-300/80 rounded-xs pointer-events-none" />
          <div className="absolute inset-2.5 border rounded-xs pointer-events-none" style={{ borderColor: borderTint }} />

          {/* Header */}
          <div className="relative z-10 text-center pt-0.5">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              {showLogo && (
                schoolLogo ? (
                  <img src={schoolLogo} alt="Logo" className="w-3.5 h-3.5 rounded object-contain shrink-0" />
                ) : (
                  <SampleSchoolLogo width={14} height={14} color={primary} className="shrink-0" />
                )
              )}
              <span className="text-[6.5px] font-black uppercase tracking-wider truncate px-1" style={{ color: primary }}>
                {schoolName}
              </span>
            </div>
            <div className="text-[7.5px] font-serif font-black uppercase text-slate-900 tracking-wide mt-0.5">
              {title || 'CERTIFICATE OF ACHIEVEMENT'}
            </div>
            <div className="text-[4.5px] font-bold uppercase tracking-widest text-slate-400">
              {subtitle || 'IN RECOGNITION OF ACADEMIC EXCELLENCE'}
            </div>
          </div>

          {/* Center Awardee */}
          <div className="relative z-10 text-center my-auto">
            <span className="text-[4px] uppercase font-bold text-slate-400 tracking-wider block">Presented Proudly To</span>
            <div
              className="inline-block text-[10px] font-serif font-black px-3 pb-0.5 border-b"
              style={{ color: primary, borderColor: '#f59e0b' }}
            >
              {studentName}
            </div>
            <p className="text-[4.5px] text-slate-500 font-medium px-4 line-clamp-1 mt-0.5">
              For exemplary dedication, outstanding performance & leadership.
            </p>
          </div>

          {/* Footer with Seal */}
          <div className="relative z-10 flex justify-between items-end px-2 pb-0.5 text-[4.5px] font-bold text-slate-600">
            <div className="text-center w-12 border-t border-slate-300 pt-0.5">
              <span>{date}</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Date</span>
            </div>

            {/* Mini Gold Seal */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border border-amber-600/40 shadow-xs flex flex-col items-center justify-center p-0.5">
              <Award className="w-2.5 h-2.5 text-amber-950" />
              <span className="text-[3px] font-black text-amber-950 leading-none">SEAL</span>
            </div>

            <div className="text-center w-12 border-t border-slate-300 pt-0.5">
              <span style={{ color: primary }} className="font-serif italic font-bold">Principal</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Director</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CERTIFICATE DESIGN 2 MINI (VINTAGE ORNATE GOLD) */}
      {isD2 && (
        <div className="w-full h-full p-2 flex flex-col justify-between bg-[#faf8f2] text-slate-900 relative overflow-hidden border-[4px] border-white shadow-2xs">
          {/* Ornate Gold Border & Corner Marks */}
          <div className="absolute inset-1 border-[1.5px] pointer-events-none" style={{ borderColor: primary }}>
            <span className="absolute -top-1.5 -left-1 text-[7px]" style={{ color: primary }}>⚜</span>
            <span className="absolute -top-1.5 -right-1 text-[7px]" style={{ color: primary }}>⚜</span>
            <span className="absolute -bottom-1.5 -left-1 text-[7px]" style={{ color: primary }}>⚜</span>
            <span className="absolute -bottom-1.5 -right-1 text-[7px]" style={{ color: primary }}>⚜</span>
          </div>

          {/* Header */}
          <div className="relative z-10 text-center pt-0.5 font-serif">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              {showLogo && (
                schoolLogo ? (
                  <img src={schoolLogo} alt="Logo" className="w-3.5 h-3.5 rounded object-contain shrink-0" />
                ) : (
                  <SampleSchoolLogo width={14} height={14} color={primary} className="shrink-0" />
                )
              )}
              <span className="text-[6.5px] font-black uppercase tracking-wider truncate px-1" style={{ color: primary }}>
                {schoolName}
              </span>
            </div>
            <div className="text-[7.5px] font-black uppercase text-slate-900 tracking-wide mt-0.5">
              {title || 'CERTIFICATE OF MERIT'}
            </div>
            <div className="flex items-center justify-center gap-1 text-[4px] mt-0.5" style={{ color: primary }}>
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
          </div>

          {/* Awardee */}
          <div className="relative z-10 text-center my-auto font-serif">
            <span className="text-[4px] uppercase font-bold text-slate-400 tracking-widest block font-sans">Honoring</span>
            <div className="text-[11px] font-serif font-black tracking-wide leading-tight" style={{ color: primary }}>
              {studentName}
            </div>
            <div className="w-16 h-px mx-auto my-0.5" style={{ backgroundColor: primary }} />
            <p className="text-[4.5px] text-slate-600 font-sans px-4 line-clamp-1">
              Conferred in recognition of exceptional scholarly merit & exemplary conduct.
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex justify-between items-end px-3 pb-0.5 text-[4.5px] font-bold text-slate-600 font-sans">
            <div className="text-center w-12 border-t pt-0.5" style={{ borderColor: primary }}>
              <span>{date}</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Date</span>
            </div>

            <div 
              className="w-6 h-6 rounded-full border border-dashed flex flex-col items-center justify-center text-[3.5px] bg-amber-50/60"
              style={{ borderColor: primary, color: primary }}
            >
              <span className="leading-none">MERIT</span>
              <span className="leading-none text-[3px]">AWARD</span>
            </div>

            <div className="text-center w-12 border-t pt-0.5" style={{ borderColor: primary }}>
              <span style={{ color: primary }} className="font-serif italic font-bold">Authorized</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Signature</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. CERTIFICATE DESIGN 3 MINI (MODERN LUXURY EMERALD) */}
      {isD3 && (
        <div className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900 relative overflow-hidden border-2" style={{ borderColor: primary }}>
          {/* Radial Glow Accents */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-amber-400 to-amber-200 opacity-30 rounded-bl-full pointer-events-none" />
          <div 
            className="absolute bottom-0 left-0 w-12 h-12 opacity-20 rounded-tr-full pointer-events-none"
            style={{ background: `linear-gradient(to top right, ${primary}, #38bdf8)` }}
          />

          {/* Header */}
          <div className="relative z-10 text-center pt-0.5">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              {showLogo ? (
                schoolLogo ? (
                  <img src={schoolLogo} alt="Logo" className="w-3.5 h-3.5 rounded object-contain shrink-0" />
                ) : (
                  <SampleSchoolLogo width={14} height={14} color={primary} className="shrink-0" />
                )
              ) : (
                <Award className="w-2.5 h-2.5" style={{ color: primary }} />
              )}
              <span className="text-[6.5px] font-black uppercase tracking-wider truncate" style={{ color: primary }}>
                {schoolName}
              </span>
            </div>
            <div className="text-[7.5px] font-serif font-black uppercase tracking-tight text-slate-900">
              {title || 'CERTIFICATE OF EXCELLENCE'}
            </div>
            <div 
              className="w-12 h-0.5 rounded-full mx-auto my-0.5"
              style={{ background: `linear-gradient(to right, ${primary}, #f59e0b)` }}
            />
          </div>

          {/* Awardee */}
          <div className="relative z-10 text-center my-auto">
            <span className="text-[4px] uppercase font-bold text-slate-400 tracking-wider block">This Distinction Is Bestowed Upon</span>
            <div className="text-[10px] font-serif font-black inline-block px-3 pb-0.5 border-b-2" style={{ color: primary, borderColor: primary }}>
              {studentName}
            </div>
            <p className="text-[4.5px] text-slate-600 font-medium px-4 line-clamp-1 mt-0.5">
              High honor for exceptional sportsmanship, energetic teamwork & dedication.
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex justify-between items-end px-3 pb-0.5 text-[4.5px] font-bold text-slate-600">
            <div className="text-center w-12 border-t border-slate-200 pt-0.5">
              <span>{date}</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Date of Issue</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full border flex items-center justify-center shadow-xs" style={{ borderColor: primary, backgroundColor: tintLight }}>
                <ShieldCheck className="w-3 h-3" style={{ color: primary }} />
              </div>
              <span className="text-[3px] font-black uppercase tracking-tighter mt-0.5" style={{ color: primary }}>Verified</span>
            </div>

            <div className="text-center w-12 border-t border-slate-200 pt-0.5">
              <span style={{ color: primary }} className="font-serif italic font-bold">Director</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Principal</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. CERTIFICATE DESIGN 4 MINI (CORPORATE COMPLETION) */}
      {isD4 && (
        <div className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900 relative overflow-hidden border" style={{ borderColor: primary }}>
          {/* Geometric Frames */}
          <div className="absolute inset-1.5 border pointer-events-none" style={{ borderColor: primary }} />
          <div className="absolute inset-2.5 border pointer-events-none" style={{ borderColor: hexToRgba(primary, 0.4) }} />

          {/* Header */}
          <div className="relative z-10 text-center pt-0.5">
            <div className="text-[6.5px] font-black uppercase tracking-wider truncate px-4" style={{ color: primary }}>
              {schoolName}
            </div>
            <div className="text-[7.5px] font-serif font-black uppercase text-slate-900 tracking-wide mt-0.5">
              {title || 'CERTIFICATE OF COMPLETION'}
            </div>
            <div className="w-10 h-0.5 mx-auto my-0.5" style={{ backgroundColor: primary }} />
          </div>

          {/* Awardee */}
          <div className="relative z-10 text-center my-auto">
            <span className="text-[4px] uppercase font-bold text-slate-400 tracking-wider block">This Document Confirms That</span>
            <div className="text-[10px] font-serif font-black inline-block px-3 pb-0.5 border-b" style={{ color: primary, borderColor: primary }}>
              {studentName}
            </div>
            <p className="text-[4.5px] text-slate-600 font-medium px-4 line-clamp-1 mt-0.5">
              Satisfactorily completed the prescribed academic curriculum and project goals.
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex justify-between items-end px-3 pb-0.5 text-[4.5px] font-bold text-slate-600">
            <div className="text-center w-12 border-t border-slate-300 pt-0.5">
              <span>{date}</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Issue Date</span>
            </div>

            {/* Mini Gold Seal */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border border-amber-600 shadow-2xs flex flex-col items-center justify-center p-0.5">
              <Award className="w-2.5 h-2.5 text-amber-950" />
            </div>

            <div className="text-center w-12 border-t border-slate-300 pt-0.5">
              <span style={{ color: primary }} className="font-serif italic font-bold">Academic Dean</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Signature</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import React from 'react'
import { QrCode, ShieldCheck, Award, Building2, Phone, Mail, MapPin, Calendar, User, HeartPulse, CheckCircle2, Sparkles, Cpu, Upload } from 'lucide-react'
import { LiveEditableText, ProperQrCode, hexToRgba } from '@/components/admit-card/AdmitCardModalPreview'

export function adjustHex(hex?: string, amount: number = 0): string {
  let c = (hex || '#0284c7').trim().replace('#', '')
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

export const ID_CARD_COLOR_PRESETS = [
  { name: 'Sky Blue', hex: '#0284C7' },
  { name: 'Ocean Teal', hex: '#0F766E' },
  { name: 'Royal Emerald', hex: '#065F46' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Burgundy', hex: '#660033' },
  { name: 'Crimson', hex: '#991B1B' },
  { name: 'Amber Gold', hex: '#B45309' },
  { name: 'Indigo', hex: '#4338CA' },
  { name: 'Plum Purple', hex: '#701A75' },
  { name: 'Midnight Slate', hex: '#0F172A' }
]

export interface IdCardCustomProps {
  schoolName?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  udiseCode?: string
  affiliationCode?: string
  title?: string
  tagline?: string
  session?: string
  principalName?: string
  principalSign?: string
  schoolLogo?: string
  showLogo?: boolean
  logoWidth?: number | string
  schoolNameFontSize?: number | string
  titleFontSize?: number | string
  taglineFontSize?: number | string
  themeColor?: string
  editable?: boolean
  customLabels?: Record<string, string>
  onUpdateField?: (field: string, value: any) => void
  onUpdateLabel?: (key: string, value: string) => void
  showQr?: boolean
  showWatermark?: boolean
  showPrincipalSign?: boolean
  showHolderSign?: boolean
  showFatherName?: boolean
  showDob?: boolean
  showAdmNo?: boolean
  showRollNo?: boolean
  showContact?: boolean
  showBloodGroup?: boolean
  showTopHeaderTagline?: boolean
  showWatermarkStamp?: boolean
  holderSignName?: string
  bottomNotes?: string
  data?: any
}

// -------------------------------------------------------------
// STUDENT DESIGN 1: MODERN VERTICAL SMART CARD (PORTRAIT)
// -------------------------------------------------------------
export const StudentDesignVertical: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'STUDENT IDENTITY CARD',
  tagline = 'Affiliated to CBSE, New Delhi',
  affiliationCode = 'CBSE-213089',
  principalName = 'M.Sharma',
  principalSign,
  schoolLogo,
  showLogo = true,
  logoWidth,
  schoolNameFontSize,
  titleFontSize,
  taglineFontSize,
  themeColor,
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel,
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showHolderSign = true,
  holderSignName = 'Aarav S.',
  showFatherName = true,
  showDob = true,
  showAdmNo = true,
  showRollNo = true,
  showContact = true,
  showBloodGroup = true,
  showTopHeaderTagline = true,
  data
}) => {
  const labels = customLabels || {}
  const updateLabel = (k: string, v: string) => onUpdateLabel?.(k, v)

  // Dynamic Theme Palette
  const primary = themeColor || '#0284c7'
  const darkTone = adjustHex(primary, -50)
  const lightTone = adjustHex(primary, 35)
  const tintLight = hexToRgba(primary, 0.08)
  const borderTint = hexToRgba(primary, 0.3)
  const actualLogoWidth = Number(logoWidth) || 48

  const role = data?.role || 'Student'
  const student = {
    name: data?.name || 'AARAV SHARMA',
    role,
    class: data?.class || data?.className || data?.designation || 'Class 10 - A',
    rollNo: data?.rollNo || data?.uniqueId || '24',
    admNo: data?.admNo || data?.empId || data?.uniqueId || 'AS-2024-1048',
    fatherName: data?.fatherName || data?.qualification || data?.workStation || data?.department || 'Rajesh Sharma',
    dob: data?.dob || data?.doj || data?.joiningDate || '14/08/2010',
    bloodGroup: data?.bloodGroup || 'O+',
    phone: data?.phone || data?.contact || '+91 98765 43210',
    photo: data?.photo || data?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[280px] h-[450px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border shrink-0 text-slate-800 select-none" style={{ borderColor: borderTint }}>
      {/* Decorative Top Wave Header with High-Contrast Emblem Logo */}
      <div 
        className="relative text-white pt-2.5 pb-7 px-3 text-center shadow-md transition-colors"
        style={{ background: `linear-gradient(135deg, ${darkTone}, ${primary}, ${lightTone})` }}
      >
        {/* Lanyard Hole Graphic Simulation */}
        <div className="w-12 h-2 bg-black/25 rounded-full mx-auto mb-1.5 border border-white/20"></div>

        {/* Prominent, Clearly Legible Emblem Badge & School Title Header */}
        <div className="flex items-center gap-2.5 mb-1 px-0.5 text-left">
          {/* High-Contrast Pure White Emblem Bay */}
          {showLogo !== false && (
            <div 
              onClick={() => {
                if (editable) onUpdateField?.('triggerLogoUpload', 'true')
              }}
              title={editable ? 'Click to select / upload institute logo' : undefined}
              className={`rounded-xl bg-white p-1 shadow-lg border-2 border-amber-400 ring-2 ring-white/70 flex items-center justify-center shrink-0 overflow-hidden relative group ${
                editable ? 'cursor-pointer hover:ring-amber-500 transition-all' : ''
              }`}
              style={{ width: `${actualLogoWidth}px`, height: `${actualLogoWidth}px` }}
            >
              {schoolLogo ? (
                <img src={schoolLogo} alt="Institute Logo" className="w-full h-full object-contain filter drop-shadow-2xs" />
              ) : (
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex flex-col items-center justify-center text-slate-900 shadow-inner p-0.5">
                  <Building2 className="w-5 h-5 text-slate-900" />
                  <span className="text-[5px] font-black uppercase tracking-tighter">LOGO</span>
                </div>
              )}
              {editable && (
                <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-lg flex flex-col items-center justify-center text-[7px] font-black transition-opacity">
                  <Upload className="w-3.5 h-3.5 mb-0.5" />
                  <span>Change</span>
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 
              className="font-black tracking-tight uppercase leading-tight line-clamp-1 drop-shadow-sm text-white"
              style={{ fontSize: parseFontSize(schoolNameFontSize) || '12px' }}
            >
              <LiveEditableText
                tag="span"
                value={schoolName}
                editable={editable}
                onSave={val => onUpdateField?.('schoolName', val)}
                style={{ fontSize: parseFontSize(schoolNameFontSize) || '12px' }}
                fontSizeControl={{
                  value: schoolNameFontSize ? parseFloat(String(schoolNameFontSize)) || 12 : 12,
                  onChange: val => onUpdateField?.('schoolNameFontSize', val),
                  label: 'Institute Name'
                }}
                tooltipPosition="bottom"
                className="inline-block"
              />
            </h2>
            {showTopHeaderTagline && (
              <p 
                className="text-white/90 font-medium tracking-wide truncate"
                style={{ fontSize: parseFontSize(taglineFontSize) || '7.5px' }}
              >
                <LiveEditableText
                  value={tagline}
                  editable={editable}
                  onSave={val => onUpdateField?.('tagline', val)}
                  style={{ fontSize: parseFontSize(taglineFontSize) || '7.5px' }}
                  fontSizeControl={{
                    value: taglineFontSize ? parseFloat(String(taglineFontSize)) || 7.5 : 7.5,
                    onChange: val => onUpdateField?.('taglineFontSize', val),
                    label: 'Tagline'
                  }}
                  tooltipPosition="bottom"
                  className="inline-block mr-1"
                />
                {affiliationCode && (
                  <>
                    • Affil:{' '}
                    <LiveEditableText
                      value={affiliationCode}
                      editable={editable}
                      onSave={val => onUpdateField?.('affiliationCode', val)}
                      className="inline-block"
                    />
                  </>
                )}
              </p>
            )}
            <p className="text-[7px] text-white/80 truncate">
              <LiveEditableText
                value={schoolAddress}
                editable={editable}
                onSave={val => onUpdateField?.('schoolAddress', val)}
                className="inline-block"
              />
            </p>
          </div>
        </div>

        {/* Role Pill */}
        <div 
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-white font-black px-3.5 py-0.5 rounded-full shadow-md tracking-wider uppercase border border-white/60 whitespace-nowrap"
          style={{ 
            backgroundColor: primary,
            fontSize: parseFontSize(titleFontSize) || '9px'
          }}
        >
          <LiveEditableText
            value={title}
            editable={editable}
            onSave={val => onUpdateField?.('title', val)}
            style={{ fontSize: parseFontSize(titleFontSize) || '9px' }}
            fontSizeControl={{
              value: titleFontSize ? parseFloat(String(titleFontSize)) || 9 : 9,
              onChange: val => onUpdateField?.('titleFontSize', val),
              label: 'Card Title'
            }}
            tooltipPosition="bottom"
            className="inline-block mr-1"
          /> •{' '}
          <LiveEditableText
            value={session}
            editable={editable}
            onSave={val => onUpdateField?.('session', val)}
            className="inline-block"
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col items-center pt-3.5 px-3.5 relative overflow-hidden">
        {/* Subtle Watermark */}
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <Building2 className="w-44 h-44 text-slate-900" />
          </div>
        )}

        {/* Student Photo */}
        <div className="relative mb-1.5 mt-0.5">
          <div 
            className="w-20 h-20 rounded-xl border-[2.5px] bg-slate-100 overflow-hidden shadow-md relative"
            style={{ borderColor: primary }}
          >
            <img 
              src={student.photo} 
              alt={student.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
            <ShieldCheck className="w-3 h-3" />
          </div>
        </div>

        {/* Student Name & Class */}
        <h3 className="font-black text-sm tracking-wide text-center uppercase leading-snug" style={{ color: primary }}>
          {student.name}
        </h3>
        <div 
          className="inline-flex items-center gap-1 border font-bold text-[9px] px-2.5 py-0.5 rounded-md mt-0.5 mb-2"
          style={{ backgroundColor: tintLight, borderColor: borderTint, color: primary }}
        >
          <span>{student.class}</span>
          {showRollNo && (
            <>
              <span>•</span>
              <span>
                <LiveEditableText
                  value={labels.rollNoLabel || (student.role === 'Teacher' || student.role === 'Employee' ? 'Dept:' : 'Roll No:')}
                  editable={editable}
                  onSave={val => updateLabel('rollNoLabel', val)}
                  className="inline-block mr-0.5"
                />
                {student.rollNo}
              </span>
            </>
          )}
        </div>

        {/* Details Grid */}
        <div className="w-full text-[10px] space-y-1 bg-slate-50/80 p-2 rounded-lg border border-slate-200/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          {showAdmNo && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.admNoLabel || (student.role === 'Teacher' ? 'Faculty ID:' : student.role === 'Employee' ? 'Staff ID:' : 'Adm No:')}
                  editable={editable}
                  onSave={val => updateLabel('admNoLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-slate-800 font-mono">{student.admNo}</span>
            </div>
          )}
          {showFatherName && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.fatherNameLabel || (student.role === 'Teacher' ? 'Qualification:' : student.role === 'Employee' ? 'Work Station:' : "Father's Name:")}
                  editable={editable}
                  onSave={val => updateLabel('fatherNameLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-slate-800 truncate max-w-[120px]">{student.fatherName}</span>
            </div>
          )}
          {showDob && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.dobLabel || (student.role === 'Teacher' || student.role === 'Employee' ? 'Joining Date:' : 'D.O.B:')}
                  editable={editable}
                  onSave={val => updateLabel('dobLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-slate-800">{student.dob}</span>
            </div>
          )}
          {showBloodGroup && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.bloodGroupLabel || 'Blood Group:'}
                  editable={editable}
                  onSave={val => updateLabel('bloodGroupLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-red-600 bg-red-50 px-1 rounded text-[9px]">{student.bloodGroup}</span>
            </div>
          )}
          {showContact && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.emergencyNoLabel || (student.role === 'Teacher' || student.role === 'Employee' ? 'Official Phone:' : 'Emergency No:')}
                  editable={editable}
                  onSave={val => updateLabel('emergencyNoLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-slate-800">{student.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Strip with Separate Signatures */}
      <div className="bg-slate-100/90 border-t border-slate-200 px-2.5 py-1.5 flex items-center justify-between mt-auto relative z-10 gap-2">
        {showQr ? (
          <div className="bg-white p-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1 shrink-0">
            <ProperQrCode className="w-8 h-8" color={primary} />
            <div className="text-[6.5px] text-slate-400 font-mono leading-none">
              <p>VERIFIED</p>
              <p>ID #{student.admNo.slice(-4)}</p>
            </div>
          </div>
        ) : <div />}

        <div className="flex items-center gap-2 ml-auto">
          {/* Cardholder / Student Separate Signature */}
          {showHolderSign && (
            <div className="text-center flex flex-col items-center">
              <div className="h-5 w-14 relative flex items-center justify-center">
                <span className="font-serif italic font-semibold text-[10px] text-slate-700 rotate-[-2deg]">
                  <LiveEditableText
                    value={holderSignName || student.name.split(' ')[0]}
                    editable={editable}
                    onSave={val => onUpdateField?.('holderSignName', val)}
                    className="inline-block"
                  />
                </span>
              </div>
              <p className="text-[6.5px] font-black text-slate-600 uppercase tracking-tighter border-t border-slate-300 pt-0.5 w-14 text-center">
                <LiveEditableText
                  value={labels.holderSignLabel || (student.role === 'Teacher' ? 'Teacher Sign' : student.role === 'Employee' ? 'Staff Sign' : 'Holder Sign')}
                  editable={editable}
                  onSave={val => updateLabel('holderSignLabel', val)}
                  className="inline-block"
                />
              </p>
            </div>
          )}

          {/* Authority / Principal Signature */}
          {showPrincipalSign && (
            <div className="text-right flex flex-col items-end">
              <div className="h-5 w-16 relative flex items-center justify-center">
                {principalSign ? (
                  <img src={principalSign} alt="Principal Signature" className="max-h-5 max-w-full object-contain drop-shadow-xs" />
                ) : (
                  <span className="font-serif italic font-black text-[10.5px] rotate-[-5deg] tracking-tight" style={{ color: primary }}>
                    <LiveEditableText
                      value={principalName || 'M.Sharma'}
                      editable={editable}
                      onSave={val => onUpdateField?.('principalName', val)}
                      className="inline-block"
                    />
                  </span>
                )}
              </div>
              <p className="text-[6.5px] font-black text-slate-600 uppercase tracking-tighter border-t border-slate-300 pt-0.5 w-16 text-center">
                <LiveEditableText
                  value={labels.principalSignLabel || 'Principal Sign'}
                  editable={editable}
                  onSave={val => updateLabel('principalSignLabel', val)}
                  className="inline-block"
                />
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact line */}
      <div className="text-white text-[7px] py-1 px-2 text-center truncate" style={{ backgroundColor: darkTone }}>
        <LiveEditableText
          value={labels.helplineLabel || 'Helpline:'}
          editable={editable}
          onSave={val => updateLabel('helplineLabel', val)}
          className="inline-block mr-1"
        />
        <LiveEditableText
          value={schoolPhone}
          editable={editable}
          onSave={val => onUpdateField?.('schoolPhone', val)}
          className="inline-block mr-1"
        />
        • {labels.validForLabel || 'Valid for'}{' '}
        <LiveEditableText
          value={session}
          editable={editable}
          onSave={val => onUpdateField?.('session', val)}
          className="inline-block"
        />
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// STUDENT DESIGN 2: ACADEMIC HORIZONTAL SMART CARD (LANDSCAPE)
// -------------------------------------------------------------
export const StudentDesignHorizontal: React.FC<IdCardCustomProps> = ({
  schoolName = 'GLOBAL HERITAGE ACADEMY',
  schoolAddress = 'Campus Road, Civil Lines, Jaipur',
  schoolPhone = '+91 141 2789123',
  session = '2025-26',
  title = 'STUDENT IDENTITY CARD',
  tagline = 'Excellence in Education',
  affiliationCode = 'CBSE AFFIL NO. 1730452',
  principalName = 'K.Singhal',
  principalSign,
  schoolLogo,
  showLogo = true,
  logoWidth,
  schoolNameFontSize,
  titleFontSize,
  taglineFontSize,
  holderSignName = 'Ananya V.',
  themeColor,
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel,
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showHolderSign = true,
  showFatherName = true,
  showDob = true,
  showAdmNo = true,
  showRollNo = true,
  showContact = true,
  showBloodGroup = true,
  data
}) => {
  const labels = customLabels || {}
  const updateLabel = (k: string, v: string) => onUpdateLabel?.(k, v)

  // Dynamic Theme Palette
  const primary = themeColor || '#047857'
  const darkTone = adjustHex(primary, -50)
  const lightTone = adjustHex(primary, 35)
  const tintLight = hexToRgba(primary, 0.08)
  const borderTint = hexToRgba(primary, 0.3)
  const actualLogoWidth = Number(logoWidth) || 52

  const student = {
    name: data?.name || 'ANANYA VERMA',
    class: data?.class || data?.className || data?.designation || 'Class VIII - Sec B',
    rollNo: data?.rollNo || data?.uniqueId || '18',
    admNo: data?.admNo || data?.uniqueId || 'GHA-2024-8842',
    fatherName: data?.fatherName || data?.department || 'Vikram Verma',
    motherName: data?.motherName || data?.qualification || 'Sunita Verma',
    dob: data?.dob || data?.joiningDate || '22/11/2011',
    bloodGroup: data?.bloodGroup || 'B+',
    phone: data?.phone || data?.contact || '+91 98101 23456',
    photo: data?.photo || data?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[450px] h-[280px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border shrink-0 select-none" style={{ borderColor: borderTint }}>
      {/* Top Banner with Distinct, Clearly Legible Emblem Badge */}
      <div 
        className="text-white px-4 py-2 flex items-center justify-between border-b-2"
        style={{ 
          background: `linear-gradient(135deg, ${darkTone}, ${primary}, ${lightTone})`,
          borderColor: borderTint
        }}
      >
        <div className="flex items-center gap-3">
          {/* Distinct Architectural Logo Showcase Bay */}
          {showLogo !== false && (
            <div 
              onClick={() => {
                if (editable) onUpdateField?.('triggerLogoUpload', 'true')
              }}
              title={editable ? 'Click to select / upload institute logo' : undefined}
              className={`rounded-2xl bg-white p-1.5 shadow-lg border-2 border-amber-400 ring-2 ring-white/70 flex items-center justify-center shrink-0 overflow-hidden relative group ${
                editable ? 'cursor-pointer hover:ring-amber-500 transition-all' : ''
              }`}
              style={{ width: `${actualLogoWidth}px`, height: `${actualLogoWidth}px` }}
            >
              {schoolLogo ? (
                <img src={schoolLogo} alt="Institute Logo" className="w-full h-full object-contain filter drop-shadow-2xs" />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex flex-col items-center justify-center text-slate-900 shadow-inner">
                  <Building2 className="w-6 h-6 text-slate-900" />
                  <span className="text-[6px] font-black uppercase tracking-tighter mt-0.5">LOGO</span>
                </div>
              )}
              {editable && (
                <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center text-[7.5px] font-black transition-opacity">
                  <Upload className="w-3.5 h-3.5 mb-0.5" />
                  <span>Change</span>
                </div>
              )}
            </div>
          )}
          <div className="text-left">
            <h2 
              className="font-black uppercase tracking-wide leading-tight drop-shadow-sm text-white"
              style={{ fontSize: parseFontSize(schoolNameFontSize) || '13px' }}
            >
              <LiveEditableText
                tag="span"
                value={schoolName}
                editable={editable}
                onSave={val => onUpdateField?.('schoolName', val)}
                style={{ fontSize: parseFontSize(schoolNameFontSize) || '13px' }}
                fontSizeControl={{
                  value: schoolNameFontSize ? parseFloat(String(schoolNameFontSize)) || 13 : 13,
                  onChange: val => onUpdateField?.('schoolNameFontSize', val),
                  label: 'Institute Name'
                }}
                tooltipPosition="bottom"
                className="inline-block"
              />
            </h2>
            <p 
              className="text-white/90 font-medium truncate max-w-[210px]"
              style={{ fontSize: parseFontSize(taglineFontSize) || '8px' }}
            >
              <LiveEditableText
                value={tagline}
                editable={editable}
                onSave={val => onUpdateField?.('tagline', val)}
                style={{ fontSize: parseFontSize(taglineFontSize) || '8px' }}
                fontSizeControl={{
                  value: taglineFontSize ? parseFloat(String(taglineFontSize)) || 8 : 8,
                  onChange: val => onUpdateField?.('taglineFontSize', val),
                  label: 'Tagline'
                }}
                tooltipPosition="bottom"
                className="inline-block mr-1"
              />
              •{' '}
              <LiveEditableText
                value={affiliationCode}
                editable={editable}
                onSave={val => onUpdateField?.('affiliationCode', val)}
                className="inline-block"
              />
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="bg-amber-400 text-slate-900 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            <LiveEditableText
              value={session}
              editable={editable}
              onSave={val => onUpdateField?.('session', val)}
              className="inline-block"
            />
          </span>
          <p className="text-[7.5px] text-white/80 mt-0.5 truncate max-w-[130px]">
            <LiveEditableText
              value={schoolAddress}
              editable={editable}
              onSave={val => onUpdateField?.('schoolAddress', val)}
              className="inline-block"
            />
          </p>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex px-4 py-2.5 gap-4 relative">
        {/* Subtle Watermark */}
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Building2 className="w-56 h-56 text-slate-900" />
          </div>
        )}

        {/* Left: Photo & Identification */}
        <div className="w-26 flex flex-col items-center justify-between shrink-0 py-0.5">
          <div 
            className="w-22 h-26 rounded-xl border-2 p-0.5 bg-white shadow-md relative"
            style={{ borderColor: primary }}
          >
            <img 
              src={student.photo} 
              alt={student.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
            <div 
              className="absolute -bottom-2 -left-2 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider"
              style={{ backgroundColor: primary }}
            >
              STUDENT
            </div>
          </div>

          {showQr && (
            <div className="flex items-center gap-1.5 bg-slate-50 border p-1 rounded-md mt-2 w-full justify-center shadow-2xs" style={{ borderColor: borderTint }}>
              <ProperQrCode className="w-6 h-6" color={primary} />
              <div className="text-[6.5px] font-mono leading-tight" style={{ color: primary }}>
                <div>SCAN TO</div>
                <div className="font-bold">VERIFY</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Data Columns */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-1 mb-2" style={{ borderColor: borderTint }}>
              <div>
                <h3 className="font-black text-base uppercase tracking-tight" style={{ color: primary }}>
                  {student.name}
                </h3>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded border inline-block"
                  style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}
                >
                  {student.class}
                </span>
              </div>
              {showRollNo && (
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 font-semibold mr-1">
                    <LiveEditableText
                      value={labels.rollNoLabel || 'Roll No:'}
                      editable={editable}
                      onSave={val => updateLabel('rollNoLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-black text-sm" style={{ color: primary }}>{student.rollNo}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9.5px]">
              {showAdmNo && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">
                    <LiveEditableText
                      value={labels.admNoLabel || 'ADMISSION NO'}
                      editable={editable}
                      onSave={val => updateLabel('admNoLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-bold text-slate-800 font-mono">{student.admNo}</span>
                </div>
              )}
              {showFatherName && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">
                    <LiveEditableText
                      value={labels.fatherNameLabel || "FATHER'S NAME"}
                      editable={editable}
                      onSave={val => updateLabel('fatherNameLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-bold text-slate-800 truncate block">{student.fatherName}</span>
                </div>
              )}
              {showDob && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">
                    <LiveEditableText
                      value={labels.dobLabel || 'DATE OF BIRTH'}
                      editable={editable}
                      onSave={val => updateLabel('dobLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-bold text-slate-800">{student.dob}</span>
                </div>
              )}
              {showBloodGroup && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">
                    <LiveEditableText
                      value={labels.bloodGroupLabel || 'BLOOD GROUP'}
                      editable={editable}
                      onSave={val => updateLabel('bloodGroupLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-black text-red-600 bg-red-50 px-1.5 py-0.2 rounded text-[9px]">{student.bloodGroup}</span>
                </div>
              )}
              {showContact && (
                <div className="col-span-2">
                  <span className="text-slate-400 font-semibold block text-[8px]">
                    <LiveEditableText
                      value={labels.emergencyNoLabel || 'EMERGENCY CONTACT'}
                      editable={editable}
                      onSave={val => updateLabel('emergencyNoLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-bold text-slate-800">{student.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row with Separate Signatures */}
          <div className="flex items-end justify-between pt-1 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[7.5px] font-mono text-slate-400 uppercase tracking-wider font-semibold">ID: {student.admNo}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Separate Holder Signature */}
              {showHolderSign && (
                <div className="text-center">
                  <div className="h-5 flex items-center justify-center">
                    <span className="font-serif italic font-semibold text-[10px] rotate-[-2deg] text-slate-700">
                      <LiveEditableText
                        value={holderSignName || student.name.split(' ')[0]}
                        editable={editable}
                        onSave={val => onUpdateField?.('holderSignName', val)}
                        className="inline-block"
                      />
                    </span>
                  </div>
                  <p className="text-[6.5px] font-black text-slate-500 uppercase tracking-tighter border-t border-slate-300 pt-0.5 w-14 text-center">
                    <LiveEditableText
                      value={labels.holderSignLabel || 'Holder Sign'}
                      editable={editable}
                      onSave={val => updateLabel('holderSignLabel', val)}
                      className="inline-block"
                    />
                  </p>
                </div>
              )}

              {/* Authority Signature */}
              {showPrincipalSign && (
                <div className="text-right">
                  <div className="h-5 flex items-center justify-end">
                    {principalSign ? (
                      <img src={principalSign} alt="Principal Signature" className="max-h-5 max-w-full object-contain drop-shadow-xs" />
                    ) : (
                      <span className="font-serif italic font-black text-xs rotate-[-4deg]" style={{ color: primary }}>
                        <LiveEditableText
                          value={principalName || 'K.Singhal'}
                          editable={editable}
                          onSave={val => onUpdateField?.('principalName', val)}
                          className="inline-block"
                        />
                      </span>
                    )}
                  </div>
                  <p className="text-[6.5px] font-black text-slate-500 uppercase tracking-tighter border-t border-slate-300 pt-0.5 w-16 text-center">
                    <LiveEditableText
                      value={labels.principalSignLabel || 'Principal Sign'}
                      editable={editable}
                      onSave={val => updateLabel('principalSignLabel', val)}
                      className="inline-block"
                    />
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="text-white text-[7.5px] py-1 px-4 flex items-center justify-between" style={{ backgroundColor: darkTone }}>
        <span>
          If found, return to school office • Tel:{' '}
          <LiveEditableText
            value={schoolPhone}
            editable={editable}
            onSave={val => onUpdateField?.('schoolPhone', val)}
            className="inline-block"
          />
        </span>
        <span 
          className="font-semibold text-amber-300"
          style={{ fontSize: parseFontSize(titleFontSize) || '8px' }}
        >
          <LiveEditableText
            value={title}
            editable={editable}
            onSave={val => onUpdateField?.('title', val)}
            style={{ fontSize: parseFontSize(titleFontSize) || '8px' }}
            fontSizeControl={{
              value: titleFontSize ? parseFloat(String(titleFontSize)) || 8 : 8,
              onChange: val => onUpdateField?.('titleFontSize', val),
              label: 'Card Title'
            }}
            tooltipPosition="top"
            className="inline-block"
          />
        </span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TEACHER DESIGN 1: EXECUTIVE VERTICAL FACULTY PASS (PORTRAIT)
// -------------------------------------------------------------
export const TeacherDesignVertical: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'FACULTY IDENTITY CARD',
  tagline = 'Faculty of Senior Academics',
  affiliationCode = 'FACULTY ID NO.',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showHolderSign = false,
  holderSignName = 'Cardholder',
  showFatherName = true,
  showDob = true,
  showAdmNo = true,
  showRollNo = true,
  showContact = true,
  showBloodGroup = true,
  showTopHeaderTagline = true,
  themeColor,
  principalName,
  principalSign,
  schoolLogo,
  showLogo = true,
  logoWidth,
  schoolNameFontSize,
  titleFontSize,
  taglineFontSize,
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel,
  data
}) => {
  const primary = themeColor || '#701a75'
  const darkTone = adjustHex(primary, -45)
  const lightTone = adjustHex(primary, 35)
  const tintLight = hexToRgba(primary, 0.08)
  const borderTint = hexToRgba(primary, 0.25)
  const actualLogoWidth = Number(logoWidth) || 48
  const labels = customLabels || {}

  const updateLabel = (key: string, val: string) => {
    onUpdateLabel?.(key, val)
  }

  const teacher = {
    name: data?.name || 'DR. MEENAKSHI SUNDARAM',
    designation: data?.designation || data?.class || data?.className || 'Senior PGT Mathematics & HOD',
    department: data?.department || data?.section || 'Science & Mathematics',
    empId: data?.empId || data?.uniqueId || data?.admNo || 'FAC-MATH-042',
    qualification: data?.qualification || (data?.fatherName ? 'Father: ' + data?.fatherName : 'M.Sc, M.Phil, Ph.D, B.Ed'),
    doj: data?.doj || data?.joiningDate || data?.dob || '12-07-2018',
    bloodGroup: data?.bloodGroup || 'AB+',
    phone: data?.phone || data?.contact || '+91 98112 34567',
    email: data?.email || 'meenakshi@academy.edu',
    photo: data?.photo || data?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[280px] h-[450px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 text-slate-800 select-none">
      {/* Luxury Royal Two-Tone Header with Dedicated White Logo Canvas */}
      <div className="relative shadow-md shrink-0">
        {/* Royal Crown Strip with Lanyard Slot */}
        <div 
          className="pt-2 pb-1.5 px-3 text-center relative"
          style={{ background: `linear-gradient(90deg, ${darkTone}, ${primary}, ${darkTone})` }}
        >
          <div className="w-12 h-2 bg-black/35 rounded-full mx-auto border border-white/20"></div>
        </div>

        {/* Pristine Pure White Brand Canvas for 100% Logo Legibility */}
        <div className="bg-white px-3 py-2 flex items-center gap-2.5 border-b-2 border-amber-400">
          {showLogo !== false && (
            <div 
              onClick={() => {
                if (editable) onUpdateField?.('triggerLogoUpload', 'true')
              }}
              title={editable ? 'Click to select / upload institute logo' : undefined}
              className={`rounded-full bg-white p-1 shadow-md border-2 border-amber-400 ring-2 ring-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative group ${
                editable ? 'cursor-pointer hover:ring-amber-500 transition-all' : ''
              }`}
              style={{ width: `${actualLogoWidth}px`, height: `${actualLogoWidth}px` }}
            >
              {schoolLogo ? (
                <img src={schoolLogo} alt="Institute Logo" className="w-full h-full object-contain filter drop-shadow-2xs" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex flex-col items-center justify-center text-slate-900 shadow-inner">
                  <Award className="w-5 h-5 text-slate-900" />
                  <span className="text-[5px] font-black uppercase">LOGO</span>
                </div>
              )}
              {editable && (
                <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-full flex flex-col items-center justify-center text-[7px] font-black transition-opacity">
                  <Upload className="w-3.5 h-3.5 mb-0.5" />
                  <span>Change</span>
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <h2 
              className="font-black tracking-tight uppercase leading-tight line-clamp-1 text-slate-900"
              style={{ fontSize: parseFontSize(schoolNameFontSize) || '12px' }}
            >
              <LiveEditableText
                value={schoolName}
                editable={editable}
                onSave={val => onUpdateField?.('schoolName', val)}
                style={{ fontSize: parseFontSize(schoolNameFontSize) || '12px' }}
                fontSizeControl={{
                  value: schoolNameFontSize ? parseFloat(String(schoolNameFontSize)) || 12 : 12,
                  onChange: val => onUpdateField?.('schoolNameFontSize', val),
                  label: 'Institute Name'
                }}
                tooltipPosition="bottom"
                className="inline-block"
              />
            </h2>
            {showTopHeaderTagline && (
              <p 
                className="font-bold tracking-wider uppercase truncate" 
                style={{ 
                  color: primary,
                  fontSize: parseFontSize(taglineFontSize) || '7.5px'
                }}
              >
                <LiveEditableText
                  value={tagline}
                  editable={editable}
                  onSave={val => onUpdateField?.('tagline', val)}
                  style={{ fontSize: parseFontSize(taglineFontSize) || '7.5px' }}
                  fontSizeControl={{
                    value: taglineFontSize ? parseFloat(String(taglineFontSize)) || 7.5 : 7.5,
                    onChange: val => onUpdateField?.('taglineFontSize', val),
                    label: 'Tagline'
                  }}
                  tooltipPosition="bottom"
                  className="inline-block mr-1"
                />
                {affiliationCode && `• ${affiliationCode}`}
              </p>
            )}
            <p className="text-[7px] text-slate-500 truncate">
              <LiveEditableText
                value={schoolAddress}
                editable={editable}
                onSave={val => onUpdateField?.('schoolAddress', val)}
                className="inline-block"
              />
            </p>
          </div>
        </div>

        {/* Role Belt */}
        <div 
          className="text-white font-black tracking-wider uppercase py-1 px-3 text-center flex items-center justify-between shadow-xs"
          style={{ 
            background: `linear-gradient(90deg, ${primary}, ${lightTone})`,
            fontSize: parseFontSize(titleFontSize) || '8px'
          }}
        >
          <span style={{ fontSize: parseFontSize(titleFontSize) || '8px' }}>
            <LiveEditableText
              value={title}
              editable={editable}
              onSave={val => onUpdateField?.('title', val)}
              style={{ fontSize: parseFontSize(titleFontSize) || '8px' }}
              fontSizeControl={{
                value: titleFontSize ? parseFloat(String(titleFontSize)) || 8 : 8,
                onChange: val => onUpdateField?.('titleFontSize', val),
                label: 'Card Title'
              }}
              tooltipPosition="bottom"
              className="inline-block"
            />
          </span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[7px] font-mono">
            <LiveEditableText
              value={session}
              editable={editable}
              onSave={val => onUpdateField?.('session', val)}
              className="inline-block"
            />
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center pt-3 px-3.5 relative overflow-hidden">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Award className="w-48 h-48 text-slate-900" />
          </div>
        )}

        {/* Faculty Photo */}
        <div className="relative mb-1.5 mt-0.5">
          <div 
            className="w-20 h-20 rounded-full border-[3px] bg-slate-50 p-0.5 shadow-md relative overflow-hidden"
            style={{ borderColor: primary }}
          >
            <img 
              src={teacher.photo} 
              alt={teacher.name}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div 
            className="absolute bottom-0 right-0 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-sm uppercase tracking-wider"
            style={{ backgroundColor: primary }}
          >
            FACULTY
          </div>
        </div>

        {/* Teacher Name & Designation */}
        <h3 className="font-black text-sm tracking-wide text-center uppercase leading-snug" style={{ color: primary }}>
          {teacher.name}
        </h3>
        <p className="text-[9.5px] font-bold text-slate-700 text-center line-clamp-1 mt-0.5 mb-2">
          {teacher.designation}
        </p>

        {/* Teacher Credentials Table */}
        <div 
          className="w-full text-[9.5px] space-y-1 p-2.5 rounded-xl border shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
          style={{ backgroundColor: tintLight, borderColor: borderTint }}
        >
          {showAdmNo && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.facultyIdLabel || 'Faculty ID:'}
                  editable={editable}
                  onSave={val => updateLabel('facultyIdLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold font-mono" style={{ color: primary }}>{teacher.empId}</span>
            </div>
          )}
          {showRollNo && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.departmentLabel || 'Department:'}
                  editable={editable}
                  onSave={val => updateLabel('departmentLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-slate-800 truncate max-w-[125px]">{teacher.department}</span>
            </div>
          )}
          {showFatherName && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.qualificationLabel || 'Qualification:'}
                  editable={editable}
                  onSave={val => updateLabel('qualificationLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-slate-800 text-[8.5px] truncate max-w-[125px]">{teacher.qualification}</span>
            </div>
          )}
          {showDob && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.dojLabel || 'Date of Joining:'}
                  editable={editable}
                  onSave={val => updateLabel('dojLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-slate-800">{teacher.doj}</span>
            </div>
          )}
          {showBloodGroup && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.bloodGroupLabel || 'Blood Group:'}
                  editable={editable}
                  onSave={val => updateLabel('bloodGroupLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-red-600 bg-red-50 px-1 rounded text-[9px]">{teacher.bloodGroup}</span>
            </div>
          )}
          {showContact && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.phoneLabel || 'Official Phone:'}
                  editable={editable}
                  onSave={val => updateLabel('phoneLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-slate-800">{teacher.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Separate Signatures */}
      <div className="bg-slate-50 border-t border-slate-200 px-2.5 py-1.5 flex items-center justify-between mt-auto relative z-10 gap-2">
        {showQr ? (
          <div className="bg-white p-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1 shrink-0">
            <ProperQrCode className="w-8 h-8" color={primary} />
            <div className="text-[6.5px] font-mono leading-none" style={{ color: primary }}>
              <p>BIOMETRIC</p>
              <p className="font-bold">VERIFIED</p>
            </div>
          </div>
        ) : <div />}

        <div className="flex items-center gap-2 ml-auto">
          {/* Separate Holder Signature */}
          {showHolderSign && (
            <div className="text-center flex flex-col items-center">
              <div className="h-5 w-14 relative flex items-center justify-center">
                <span className="font-serif italic font-semibold text-[10px] text-slate-700 rotate-[-2deg]">
                  <LiveEditableText
                    value={holderSignName || teacher.name.split(' ')[0]}
                    editable={editable}
                    onSave={val => onUpdateField?.('holderSignName', val)}
                    className="inline-block"
                  />
                </span>
              </div>
              <p className="text-[6.5px] font-black text-slate-600 uppercase tracking-tighter border-t border-slate-300 pt-0.5 w-14 text-center">
                <LiveEditableText
                  value={labels.holderSignLabel || 'Holder Sign'}
                  editable={editable}
                  onSave={val => updateLabel('holderSignLabel', val)}
                  className="inline-block"
                />
              </p>
            </div>
          )}

          {/* Authority / Principal Signature */}
          {showPrincipalSign && (
            <div className="text-right flex flex-col items-end">
              <div className="h-5 w-16 relative flex items-center justify-center">
                {principalSign ? (
                  <img src={principalSign} alt="Authority Signature" className="max-h-5 max-w-full object-contain drop-shadow-xs" />
                ) : (
                  <span className="font-serif italic font-black text-[11px] rotate-[-4deg]" style={{ color: primary }}>
                    <LiveEditableText
                      value={principalName || 'Director.A'}
                      editable={editable}
                      onSave={val => onUpdateField?.('principalName', val)}
                      className="inline-block"
                    />
                  </span>
                )}
              </div>
              <p className="text-[6.5px] font-black text-slate-600 uppercase tracking-tighter">
                <LiveEditableText
                  value={labels.principalSignLabel || 'Authorized Signatory'}
                  editable={editable}
                  onSave={val => updateLabel('principalSignLabel', val)}
                  className="inline-block"
                />
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Security strip */}
      <div 
        className="text-white text-[7px] py-1 px-3 flex items-center justify-between"
        style={{ background: `linear-gradient(90deg, ${darkTone}, ${primary})` }}
      >
        <span>
          Academic Year:{' '}
          <LiveEditableText
            value={session}
            editable={editable}
            onSave={val => onUpdateField?.('session', val)}
            className="inline-block font-semibold"
          />
        </span>
        <span className="text-amber-300 font-mono font-bold">STATUS: REGULAR FACULTY</span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TEACHER DESIGN 2: PRESTIGE HORIZONTAL FACULTY BADGE (LANDSCAPE)
// -------------------------------------------------------------
export const TeacherDesignHorizontal: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'FACULTY IDENTITY CARD',
  tagline = 'Affiliated to CBSE, New Delhi',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  themeColor,
  principalName,
  schoolNameFontSize,
  titleFontSize,
  taglineFontSize,
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel,
  data
}) => {
  const primary = themeColor || '#0d9488'
  const darkTone = adjustHex(primary, -50)
  const lightTone = adjustHex(primary, 35)
  const tintLight = hexToRgba(primary, 0.08)
  const borderTint = hexToRgba(primary, 0.25)
  const labels = customLabels || {}

  const updateLabel = (key: string, val: string) => {
    onUpdateLabel?.(key, val)
  }

  const teacher = {
    name: data?.name || 'PROF. RAJESH MALHOTRA',
    designation: data?.designation || 'HOD English & Linguistics',
    department: data?.department || 'Department of Languages',
    empId: data?.empId || 'FAC-ENG-108',
    qualification: data?.qualification || 'M.A., M.Phil., UGC-NET, B.Ed',
    experience: data?.experience || '12+ Years Experience',
    bloodGroup: data?.bloodGroup || 'A+',
    phone: data?.phone || '+91 98450 11223',
    email: data?.email || 'r.malhotra@academy.edu',
    photo: data?.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[450px] h-[280px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 select-none">
      {/* Top Banner */}
      <div 
        className="text-white px-4 py-2 flex items-center justify-between border-b-2"
        style={{
          background: `linear-gradient(90deg, ${darkTone} 0%, ${adjustHex(primary, -20)} 45%, ${primary} 100%)`,
          borderBottomColor: lightTone
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-black shadow-sm"
            style={{ color: primary }}
          >
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 
              className="font-black uppercase tracking-wide leading-tight drop-shadow-sm"
              style={{ fontSize: parseFontSize(schoolNameFontSize) || '14px' }}
            >
              <LiveEditableText
                value={schoolName}
                editable={editable}
                onSave={val => onUpdateField?.('schoolName', val)}
                style={{ fontSize: parseFontSize(schoolNameFontSize) || '14px' }}
                fontSizeControl={{
                  value: schoolNameFontSize ? parseFloat(String(schoolNameFontSize)) || 14 : 14,
                  onChange: val => onUpdateField?.('schoolNameFontSize', val),
                  label: 'Institute Name'
                }}
                tooltipPosition="bottom"
                className="inline-block"
              />
            </h2>
            <p 
              className="text-white/90 font-medium"
              style={{ fontSize: parseFontSize(taglineFontSize) || '8px' }}
            >
              <LiveEditableText
                value={tagline}
                editable={editable}
                onSave={val => onUpdateField?.('tagline', val)}
                style={{ fontSize: parseFontSize(taglineFontSize) || '8px' }}
                fontSizeControl={{
                  value: taglineFontSize ? parseFloat(String(taglineFontSize)) || 8 : 8,
                  onChange: val => onUpdateField?.('taglineFontSize', val),
                  label: 'Tagline'
                }}
                tooltipPosition="bottom"
                className="inline-block"
              />
              {' '}• CAMPUS ID
            </p>
          </div>
        </div>
        <div className="text-right">
          <span 
            className="font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs text-white"
            style={{ 
              backgroundColor: primary,
              fontSize: parseFontSize(titleFontSize) || '9px'
            }}
          >
            FACULTY • {session}
          </span>
          <p className="text-[7.5px] text-white/80 mt-0.5 truncate max-w-[140px]">
            <LiveEditableText
              value={schoolAddress}
              editable={editable}
              onSave={val => onUpdateField?.('schoolAddress', val)}
              className="inline-block"
            />
          </p>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex px-4 py-2.5 gap-4 relative">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Award className="w-56 h-56 text-slate-900" />
          </div>
        )}

        {/* Left Column: Photo & Badges */}
        <div className="w-28 flex flex-col items-center justify-between shrink-0">
          <div 
            className="w-24 h-28 rounded-xl border-2 p-0.5 bg-white shadow-md relative"
            style={{ borderColor: primary }}
          >
            <img 
              src={teacher.photo} 
              alt={teacher.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
            <div 
              className="absolute -bottom-2 -left-2 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm"
              style={{ backgroundColor: primary }}
            >
              TEACHER
            </div>
          </div>

          {showQr && (
            <div 
              className="flex items-center gap-1.5 bg-slate-50 border p-1 rounded-md mt-2 w-full justify-center"
              style={{ borderColor: borderTint }}
            >
              <ProperQrCode className="w-6 h-6" color={primary} />
              <div className="text-[6.5px] font-mono leading-tight" style={{ color: primary }}>
                <div>STAFF PORTAL</div>
                <div className="font-bold">AUTH ID</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Faculty Information */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-1 mb-2" style={{ borderColor: borderTint }}>
              <div>
                <h3 className="font-black text-base uppercase tracking-tight" style={{ color: primary }}>
                  {teacher.name}
                </h3>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded border inline-block"
                  style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}
                >
                  {teacher.designation}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-slate-400 font-semibold block">
                  <LiveEditableText
                    value={labels.facultyIdLabel || 'FACULTY ID'}
                    editable={editable}
                    onSave={val => updateLabel('facultyIdLabel', val)}
                    className="inline-block"
                  />
                </span>
                <span className="font-black text-sm font-mono" style={{ color: primary }}>{teacher.empId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9.5px]">
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">
                  <LiveEditableText
                    value={labels.departmentLabel || 'DEPARTMENT'}
                    editable={editable}
                    onSave={val => updateLabel('departmentLabel', val)}
                    className="inline-block"
                  />
                </span>
                <span className="font-bold text-slate-800 truncate block">{teacher.department}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">
                  <LiveEditableText
                    value={labels.qualificationLabel || 'QUALIFICATION'}
                    editable={editable}
                    onSave={val => updateLabel('qualificationLabel', val)}
                    className="inline-block"
                  />
                </span>
                <span className="font-bold text-slate-800 truncate block">{teacher.qualification}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">
                  <LiveEditableText
                    value={labels.experienceLabel || 'EXPERIENCE'}
                    editable={editable}
                    onSave={val => updateLabel('experienceLabel', val)}
                    className="inline-block"
                  />
                </span>
                <span className="font-bold text-slate-800">{teacher.experience}</span>
              </div>
              {showBloodGroup && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">
                    <LiveEditableText
                      value={labels.bloodGroupLabel || 'BLOOD GROUP'}
                      editable={editable}
                      onSave={val => updateLabel('bloodGroupLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-black text-red-600 bg-red-50 px-1.5 py-0.2 rounded text-[9px]">{teacher.bloodGroup}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">
                  <LiveEditableText
                    value={labels.phoneLabel || 'CONTACT'}
                    editable={editable}
                    onSave={val => updateLabel('phoneLabel', val)}
                    className="inline-block"
                  />
                </span>
                <span className="font-bold text-slate-800">{teacher.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">
                  <LiveEditableText
                    value={labels.emailLabel || 'EMAIL'}
                    editable={editable}
                    onSave={val => updateLabel('emailLabel', val)}
                    className="inline-block"
                  />
                </span>
                <span className="font-bold text-slate-800 truncate block">{teacher.email}</span>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-end justify-between pt-1 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-2">
              <div className="h-6 flex items-end gap-[1.5px] px-1 bg-white border border-slate-200 rounded">
                {[2,1,2,3,1,1,2,3,1,2,1,3,2,1,1,2].map((w, idx) => (
                  <div key={idx} className="h-full" style={{ width: `${w * 1.3}px`, backgroundColor: primary }}></div>
                ))}
              </div>
              <span className="text-[7.5px] font-mono text-slate-400">{teacher.empId}</span>
            </div>

            {showPrincipalSign && (
              <div className="text-right">
                <div className="h-5 flex items-center justify-end">
                  <span className="font-serif italic font-black text-xs rotate-[-4deg]" style={{ color: primary }}>
                    <LiveEditableText
                      value={principalName || 'Prof.R.Gupta'}
                      editable={editable}
                      onSave={val => onUpdateField?.('principalName', val)}
                      className="inline-block"
                    />
                  </span>
                </div>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
                  <LiveEditableText
                    value={labels.principalSignLabel || 'Authorized Signatory'}
                    editable={editable}
                    onSave={val => updateLabel('principalSignLabel', val)}
                    className="inline-block"
                  />
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="text-white text-[7.5px] py-1 px-4 flex items-center justify-between" style={{ backgroundColor: darkTone }}>
        <span>Campus Faculty Card • Return if found to {schoolAddress}</span>
        <span className="font-bold text-amber-300">VALID SESSION: {session}</span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// EMPLOYEE DESIGN 1: CORPORATE VERTICAL STAFF PASS (PORTRAIT)
// -------------------------------------------------------------
export const EmployeeDesignVertical: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'STAFF IDENTITY CARD',
  tagline = 'Administrative & Support Staff',
  affiliationCode = 'STAFF CODE',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  showTopHeaderTagline = true,
  themeColor,
  principalName,
  schoolNameFontSize,
  titleFontSize,
  taglineFontSize,
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel,
  data
}) => {
  const primary = themeColor || '#2563eb'
  const darkTone = adjustHex(primary, -50)
  const lightTone = adjustHex(primary, 35)
  const tintLight = hexToRgba(primary, 0.08)
  const borderTint = hexToRgba(primary, 0.25)
  const labels = customLabels || {}

  const updateLabel = (key: string, val: string) => {
    onUpdateLabel?.(key, val)
  }

  const staff = {
    name: data?.name || 'VIKRAM SINGH RATHORE',
    designation: data?.designation || 'Administrative Officer',
    department: data?.department || 'Administration & Accounts',
    empId: data?.empId || 'EMP-ADM-019',
    shift: data?.shift || 'Main Campus • Day Shift',
    doj: data?.doj || '05-02-2020',
    bloodGroup: data?.bloodGroup || 'A+',
    phone: data?.phone || '+91 97123 45678',
    emergencyContact: data?.emergencyContact || '+91 97123 99999',
    photo: data?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[280px] h-[450px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 text-slate-800 select-none">
      {/* High-Tech Modern Header */}
      <div 
        className="relative text-white pt-3 pb-8 px-3 text-center shadow-md"
        style={{
          background: `linear-gradient(135deg, ${darkTone} 0%, ${primary} 60%, ${lightTone} 100%)`
        }}
      >
        {/* Realistic Lanyard Hole */}
        <div className="w-12 h-2.5 bg-black/30 rounded-full mx-auto mb-1 border border-white/20"></div>

        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <div 
            className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-black text-[10px] shadow-sm"
            style={{ color: primary }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <h2 
            className="font-black tracking-tight uppercase leading-tight line-clamp-1 drop-shadow-sm"
            style={{ fontSize: parseFontSize(schoolNameFontSize) || '13px' }}
          >
            <LiveEditableText
              value={schoolName}
              editable={editable}
              onSave={val => onUpdateField?.('schoolName', val)}
              style={{ fontSize: parseFontSize(schoolNameFontSize) || '13px' }}
              fontSizeControl={{
                value: schoolNameFontSize ? parseFloat(String(schoolNameFontSize)) || 13 : 13,
                onChange: val => onUpdateField?.('schoolNameFontSize', val),
                label: 'Institute Name'
              }}
              tooltipPosition="bottom"
              className="inline-block"
            />
          </h2>
        </div>

        {showTopHeaderTagline && (
          <p 
            className="text-white/90 font-semibold tracking-wider uppercase"
            style={{ fontSize: parseFontSize(taglineFontSize) || '8px' }}
          >
            <LiveEditableText
              value={tagline}
              editable={editable}
              onSave={val => onUpdateField?.('tagline', val)}
              style={{ fontSize: parseFontSize(taglineFontSize) || '8px' }}
              fontSizeControl={{
                value: taglineFontSize ? parseFloat(String(taglineFontSize)) || 8 : 8,
                onChange: val => onUpdateField?.('taglineFontSize', val),
                label: 'Tagline'
              }}
              tooltipPosition="bottom"
              className="inline-block"
            />
          </p>
        )}
        <p className="text-[7.5px] text-white/80 truncate">
          <LiveEditableText
            value={schoolAddress}
            editable={editable}
            onSave={val => onUpdateField?.('schoolAddress', val)}
            className="inline-block"
          />
        </p>

        {/* Badge Pill */}
        <div 
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-white font-black px-3.5 py-0.5 rounded-full shadow-md tracking-wider uppercase border border-white"
          style={{ 
            backgroundColor: primary,
            fontSize: parseFontSize(titleFontSize) || '9px'
          }}
        >
          <LiveEditableText
            value={title}
            editable={editable}
            onSave={val => onUpdateField?.('title', val)}
            style={{ fontSize: parseFontSize(titleFontSize) || '9px' }}
            fontSizeControl={{
              value: titleFontSize ? parseFloat(String(titleFontSize)) || 9 : 9,
              onChange: val => onUpdateField?.('titleFontSize', val),
              label: 'Card Title'
            }}
            tooltipPosition="bottom"
            className="inline-block"
          />
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center pt-5 px-4 relative">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Building2 className="w-48 h-48 text-slate-950" />
          </div>
        )}

        {/* Staff Photo */}
        <div className="relative mb-2 mt-1">
          <div 
            className="w-24 h-24 rounded-2xl border-[3px] bg-slate-100 p-0.5 shadow-md relative overflow-hidden"
            style={{ borderColor: primary }}
          >
            <img 
              src={staff.photo} 
              alt={staff.name}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-10 h-10" />
            </div>
          </div>
          <div 
            className="absolute -bottom-2 -right-2 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm flex items-center gap-0.5"
            style={{ backgroundColor: primary }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            ACTIVE
          </div>
        </div>

        {/* Staff Name & Designation */}
        <h3 className="font-black text-sm text-slate-900 tracking-wide text-center uppercase leading-snug">
          {staff.name}
        </h3>
        <p className="text-[9.5px] font-bold text-center line-clamp-1 mt-0.5 mb-2" style={{ color: primary }}>
          {staff.designation}
        </p>

        {/* Staff Details Card */}
        <div 
          className="w-full text-[9.5px] space-y-1 p-2.5 rounded-xl border shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
          style={{ backgroundColor: tintLight, borderColor: borderTint }}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">
              <LiveEditableText
                value={labels.staffIdLabel || 'Staff ID:'}
                editable={editable}
                onSave={val => updateLabel('staffIdLabel', val)}
                className="inline-block"
              />
            </span>
            <span className="font-bold font-mono" style={{ color: primary }}>{staff.empId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">
              <LiveEditableText
                value={labels.departmentLabel || 'Department:'}
                editable={editable}
                onSave={val => updateLabel('departmentLabel', val)}
                className="inline-block"
              />
            </span>
            <span className="font-bold text-slate-800 truncate max-w-[125px]">{staff.department}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">
              <LiveEditableText
                value={labels.shiftLabel || 'Campus Shift:'}
                editable={editable}
                onSave={val => updateLabel('shiftLabel', val)}
                className="inline-block"
              />
            </span>
            <span className="font-bold text-slate-800 text-[8.5px] truncate max-w-[125px]">{staff.shift}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">
              <LiveEditableText
                value={labels.dojLabel || 'Date of Joining:'}
                editable={editable}
                onSave={val => updateLabel('dojLabel', val)}
                className="inline-block"
              />
            </span>
            <span className="font-bold text-slate-800">{staff.doj}</span>
          </div>
          {showBloodGroup && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                <LiveEditableText
                  value={labels.bloodGroupLabel || 'Blood Group:'}
                  editable={editable}
                  onSave={val => updateLabel('bloodGroupLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-red-600 bg-red-50 px-1 rounded text-[9px]">{staff.bloodGroup}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">
              <LiveEditableText
                value={labels.emergencyNoLabel || 'Emergency No:'}
                editable={editable}
                onSave={val => updateLabel('emergencyNoLabel', val)}
                className="inline-block"
              />
            </span>
            <span className="font-bold text-slate-800">{staff.emergencyContact}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-100/90 border-t border-slate-200 px-3 py-2 flex items-center justify-between mt-auto relative z-10">
        {showQr ? (
          <div className="bg-white p-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1.5">
            <ProperQrCode className="w-8 h-8" color={primary} />
            <div className="text-[6.5px] font-mono leading-none" style={{ color: primary }}>
              <p>ACCESS GATE</p>
              <p className="font-bold">AUTHORIZED</p>
            </div>
          </div>
        ) : <div />}

        {showPrincipalSign && (
          <div className="text-right flex flex-col items-end">
            <div className="h-6 w-20 relative flex items-center justify-center">
              <span className="font-serif italic font-black text-slate-900 text-[11px] rotate-[-5deg]" style={{ color: primary }}>
                <LiveEditableText
                  value={principalName || 'Admin.Dir'}
                  editable={editable}
                  onSave={val => onUpdateField?.('principalName', val)}
                  className="inline-block"
                />
              </span>
              <div 
                className="absolute inset-0 border rounded-full rotate-[-5deg] pointer-events-none opacity-40"
                style={{ borderColor: primary }}
              ></div>
            </div>
            <p className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">
              <LiveEditableText
                value={labels.principalSignLabel || 'Admin Signature'}
                editable={editable}
                onSave={val => updateLabel('principalSignLabel', val)}
                className="inline-block"
              />
            </p>
          </div>
        )}
      </div>

      {/* Security strip */}
      <div className="text-white text-[7px] py-1 px-3 flex items-center justify-between" style={{ backgroundColor: darkTone }}>
        <span>
          Card Validity:{' '}
          <LiveEditableText
            value={session}
            editable={editable}
            onSave={val => onUpdateField?.('session', val)}
            className="inline-block font-semibold"
          />
        </span>
        <span className="text-emerald-400 font-mono font-bold">PERMANENT STAFF</span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// EMPLOYEE DESIGN 2: MODERN HORIZONTAL STAFF PASS (LANDSCAPE)
// -------------------------------------------------------------
export const EmployeeDesignHorizontal: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'STAFF IDENTITY CARD',
  tagline = 'Campus Operations & Staff',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showHolderSign = false,
  holderSignName = 'Cardholder',
  showFatherName = true,
  showDob = true,
  showAdmNo = true,
  showRollNo = true,
  showContact = true,
  showBloodGroup = true,
  themeColor,
  principalName,
  principalSign,
  schoolLogo,
  showLogo = true,
  logoWidth,
  schoolNameFontSize,
  titleFontSize,
  taglineFontSize,
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel,
  data
}) => {
  const primary = themeColor || '#4338ca'
  const darkTone = adjustHex(primary, -50)
  const lightTone = adjustHex(primary, 35)
  const tintLight = hexToRgba(primary, 0.08)
  const borderTint = hexToRgba(primary, 0.25)
  const actualLogoWidth = Number(logoWidth) || 52
  const labels = customLabels || {}

  const updateLabel = (key: string, val: string) => {
    onUpdateLabel?.(key, val)
  }

  const staff = {
    name: data?.name || 'VIKRAM SINGH RATHORE',
    designation: data?.designation || data?.class || data?.className || 'Administrative Officer',
    department: data?.department || data?.section || 'Operations & Administration',
    empId: data?.empId || data?.uniqueId || data?.admNo || 'EMP-ADM-019',
    workStation: data?.workStation || (data?.fatherName ? 'Guardian: ' + data?.fatherName : 'Central Administration Block'),
    bloodGroup: data?.bloodGroup || 'A+',
    phone: data?.phone || data?.contact || '+91 97123 45678',
    emergencyContact: data?.emergencyContact || data?.contact || '+91 97123 99999',
    photo: data?.photo || data?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[450px] h-[280px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 select-none">
      {/* Top Banner with Distinct High-Contrast Emblem Logo */}
      <div 
        className="text-white px-4 py-2 flex items-center justify-between border-b-2"
        style={{
          background: `linear-gradient(90deg, ${darkTone} 0%, ${adjustHex(primary, -20)} 40%, ${primary} 100%)`,
          borderBottomColor: lightTone
        }}
      >
        <div className="flex items-center gap-3">
          {/* Distinct High-Contrast Modern Tech Logo Pod */}
          {showLogo !== false && (
            <div 
              onClick={() => {
                if (editable) onUpdateField?.('triggerLogoUpload', 'true')
              }}
              title={editable ? 'Click to select / upload institute logo' : undefined}
              className={`rounded-xl bg-white p-1.5 shadow-lg border-2 border-cyan-400 ring-2 ring-white/70 flex items-center justify-center shrink-0 overflow-hidden relative group ${
                editable ? 'cursor-pointer hover:ring-cyan-500 transition-all' : ''
              }`}
              style={{ width: `${actualLogoWidth}px`, height: `${actualLogoWidth}px` }}
            >
              {schoolLogo ? (
                <img src={schoolLogo} alt="Institute Logo" className="w-full h-full object-contain filter drop-shadow-2xs" />
              ) : (
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex flex-col items-center justify-center text-white shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-white" />
                  <span className="text-[6px] font-black uppercase tracking-tighter mt-0.5">LOGO</span>
                </div>
              )}
              {editable && (
                <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center text-[7.5px] font-black transition-opacity">
                  <Upload className="w-3.5 h-3.5 mb-0.5" />
                  <span>Change</span>
                </div>
              )}
            </div>
          )}
          <div>
            <h2 
              className="font-black uppercase tracking-wide leading-tight drop-shadow-sm text-white"
              style={{ fontSize: parseFontSize(schoolNameFontSize) || '13px' }}
            >
              <LiveEditableText
                value={schoolName}
                editable={editable}
                onSave={val => onUpdateField?.('schoolName', val)}
                style={{ fontSize: parseFontSize(schoolNameFontSize) || '13px' }}
                fontSizeControl={{
                  value: schoolNameFontSize ? parseFloat(String(schoolNameFontSize)) || 13 : 13,
                  onChange: val => onUpdateField?.('schoolNameFontSize', val),
                  label: 'Institute Name'
                }}
                tooltipPosition="bottom"
                className="inline-block"
              />
            </h2>
            <p 
              className="text-white/90 font-medium"
              style={{ fontSize: parseFontSize(taglineFontSize) || '8px' }}
            >
              <LiveEditableText
                value={tagline}
                editable={editable}
                onSave={val => onUpdateField?.('tagline', val)}
                style={{ fontSize: parseFontSize(taglineFontSize) || '8px' }}
                fontSizeControl={{
                  value: taglineFontSize ? parseFloat(String(taglineFontSize)) || 8 : 8,
                  onChange: val => onUpdateField?.('taglineFontSize', val),
                  label: 'Tagline'
                }}
                tooltipPosition="bottom"
                className="inline-block"
              />
              {' '}• STAFF CREDENTIAL
            </p>
          </div>
        </div>
        <div className="text-right">
          <span 
            className="font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs text-white inline-flex items-center gap-1"
            style={{ 
              backgroundColor: primary,
              fontSize: parseFontSize(titleFontSize) || '9px'
            }}
          >
            <LiveEditableText
              value={title}
              editable={editable}
              onSave={val => onUpdateField?.('title', val)}
              style={{ fontSize: parseFontSize(titleFontSize) || '9px' }}
              fontSizeControl={{
                value: titleFontSize ? parseFloat(String(titleFontSize)) || 9 : 9,
                onChange: val => onUpdateField?.('titleFontSize', val),
                label: 'Card Title'
              }}
              tooltipPosition="bottom"
              className="inline-block"
            /> • {session}
          </span>
          <p className="text-[7.5px] text-white/80 mt-0.5 truncate max-w-[140px]">
            <LiveEditableText
              value={schoolAddress}
              editable={editable}
              onSave={val => onUpdateField?.('schoolAddress', val)}
              className="inline-block"
            />
          </p>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex px-4 py-2.5 gap-4 relative">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Building2 className="w-56 h-56 text-slate-900" />
          </div>
        )}

        {/* Left Column: Photo & Security QR */}
        <div className="w-26 flex flex-col items-center justify-between shrink-0 py-0.5">
          <div 
            className="w-22 h-26 rounded-xl border-2 p-0.5 bg-white shadow-md relative"
            style={{ borderColor: primary }}
          >
            <img 
              src={staff.photo} 
              alt={staff.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
            <div 
              className="absolute -bottom-2 -left-2 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm"
              style={{ backgroundColor: primary }}
            >
              EMPLOYEE
            </div>
          </div>

          {showQr && (
            <div 
              className="flex items-center gap-1.5 bg-slate-50 border p-1 rounded-md mt-2 w-full justify-center"
              style={{ borderColor: borderTint }}
            >
              <ProperQrCode className="w-6 h-6" color={primary} />
              <div className="text-[6.5px] font-mono leading-tight" style={{ color: primary }}>
                <div>SECURITY PASS</div>
                <div className="font-bold">GATE 01-04</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Staff Information */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-1 mb-2" style={{ borderColor: borderTint }}>
              <div>
                <h3 className="font-black text-base text-slate-900 uppercase tracking-tight">
                  {staff.name}
                </h3>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded border inline-block"
                  style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}
                >
                  {staff.designation}
                </span>
              </div>
              {showAdmNo && (
                <div className="text-right">
                  <span className="text-[8px] text-slate-400 font-semibold block">
                    <LiveEditableText
                      value={labels.staffIdLabel || 'STAFF ID'}
                      editable={editable}
                      onSave={val => updateLabel('staffIdLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-black text-sm font-mono" style={{ color: primary }}>{staff.empId}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9.5px]">
              {showRollNo && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">
                    <LiveEditableText
                      value={labels.departmentLabel || 'DEPARTMENT'}
                      editable={editable}
                      onSave={val => updateLabel('departmentLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-bold text-slate-800 truncate block">{staff.department}</span>
                </div>
              )}
              {showFatherName && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">
                    <LiveEditableText
                      value={labels.workStationLabel || 'WORK STATION'}
                      editable={editable}
                      onSave={val => updateLabel('workStationLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-bold text-slate-800 truncate block">{staff.workStation}</span>
                </div>
              )}
              {showBloodGroup && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">
                    <LiveEditableText
                      value={labels.bloodGroupLabel || 'BLOOD GROUP'}
                      editable={editable}
                      onSave={val => updateLabel('bloodGroupLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-black text-red-600 bg-red-50 px-1.5 py-0.2 rounded text-[9px]">{staff.bloodGroup}</span>
                </div>
              )}
              {showContact && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">
                    <LiveEditableText
                      value={labels.phoneLabel || 'OFFICIAL CONTACT'}
                      editable={editable}
                      onSave={val => updateLabel('phoneLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-bold text-slate-800">{staff.phone}</span>
                </div>
              )}
              {showContact && (
                <div className="col-span-2">
                  <span className="text-slate-400 font-semibold block text-[8px]">
                    <LiveEditableText
                      value={labels.emergencyNoLabel || 'EMERGENCY CONTACT'}
                      editable={editable}
                      onSave={val => updateLabel('emergencyNoLabel', val)}
                      className="inline-block"
                    />
                  </span>
                  <span className="font-bold text-slate-800">{staff.emergencyContact}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row with Separate Signatures */}
          <div className="flex items-end justify-between pt-1 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[7.5px] font-mono text-slate-400 font-semibold uppercase tracking-wider">STAFF ID: {staff.empId}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Separate Holder Signature */}
              {showHolderSign && (
                <div className="text-center">
                  <div className="h-5 flex items-center justify-center">
                    <span className="font-serif italic font-semibold text-[10px] rotate-[-2deg] text-slate-700">
                      <LiveEditableText
                        value={holderSignName || staff.name.split(' ')[0]}
                        editable={editable}
                        onSave={val => onUpdateField?.('holderSignName', val)}
                        className="inline-block"
                      />
                    </span>
                  </div>
                  <p className="text-[6.5px] font-black text-slate-500 uppercase tracking-tighter border-t border-slate-300 pt-0.5 w-14 text-center">
                    <LiveEditableText
                      value={labels.holderSignLabel || 'Holder Sign'}
                      editable={editable}
                      onSave={val => updateLabel('holderSignLabel', val)}
                      className="inline-block"
                    />
                  </p>
                </div>
              )}

              {/* Authority Signature */}
              {showPrincipalSign && (
                <div className="text-right">
                  <div className="h-5 flex items-center justify-end">
                    {principalSign ? (
                      <img src={principalSign} alt="Authority Signature" className="max-h-5 max-w-full object-contain drop-shadow-xs" />
                    ) : (
                      <span className="font-serif italic font-black text-xs rotate-[-4deg]" style={{ color: primary }}>
                        <LiveEditableText
                          value={principalName || 'Registrar.S'}
                          editable={editable}
                          onSave={val => onUpdateField?.('principalName', val)}
                          className="inline-block"
                        />
                      </span>
                    )}
                  </div>
                  <p className="text-[6.5px] font-black text-slate-500 uppercase tracking-tighter border-t border-slate-300 pt-0.5 w-16 text-center">
                    <LiveEditableText
                      value={labels.principalSignLabel || 'Registrar / Principal'}
                      editable={editable}
                      onSave={val => updateLabel('principalSignLabel', val)}
                      className="inline-block"
                    />
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="text-white text-[7.5px] py-1 px-4 flex items-center justify-between" style={{ backgroundColor: darkTone }}>
        <span>Campus Non-Teaching Staff Pass • Valid at all institutional gates</span>
        <span className="font-bold text-amber-300">ACCESS: ALL BLOCKS</span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// CARD BACK SIDE TEMPLATE (SUPPORTING BOTH PORTRAIT & LANDSCAPE)
// -------------------------------------------------------------
export const DEFAULT_ID_CARD_GUIDELINES = [
  'This card is non-transferable and remains the property of the institute.',
  'Must be worn visibly during school/campus hours.',
  'Loss of this card should be reported to the office immediately.',
  'Damage or misuse of the card is strictly prohibited.',
  'Valid only for authorized campus access and library services.'
]

export const IdCardBackDesign: React.FC<{
  orientation?: 'portrait' | 'landscape'
  schoolName?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  bottomNotes?: string
  themeColor?: string
  termsTitle?: string
  termsGuidelines?: string | string[]
  editable?: boolean
  onUpdateField?: (field: string, value: any) => void
}> = ({
  orientation = 'portrait',
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi - 110001',
  schoolPhone = '+91 11 2345 6789',
  schoolEmail = 'info@academy.edu',
  bottomNotes = 'This card is the property of the institute. If found, please return to the school administration office immediately.',
  themeColor,
  termsTitle = 'Terms & Campus Guidelines',
  termsGuidelines,
  editable = false,
  onUpdateField
}) => {
  const primary = themeColor || '#1e3a8a'
  const borderTint = hexToRgba(primary, 0.25)
  const tintLight = hexToRgba(primary, 0.05)

  const parsedGuidelines = React.useMemo(() => {
    if (Array.isArray(termsGuidelines) && termsGuidelines.length > 0) {
      return termsGuidelines.map(l => l.replace(/^[•\-\*\d\.\s]+/, '').trim()).filter(Boolean)
    }
    if (typeof termsGuidelines === 'string' && termsGuidelines.trim().length > 0) {
      const split = termsGuidelines
        .split('\n')
        .map(l => l.replace(/^[•\-\*\d\.\s]+/, '').trim())
        .filter(Boolean)
      if (split.length > 0) return split
    }
    return DEFAULT_ID_CARD_GUIDELINES
  }, [termsGuidelines])

  if (orientation === 'landscape') {
    return (
      <div 
        className="w-[450px] h-[280px] rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border shrink-0 p-5 select-none text-slate-700"
        style={{ backgroundColor: tintLight, borderColor: borderTint }}
      >
        <h4 
          className="font-black text-xs uppercase tracking-wider border-b pb-1 mb-2 flex items-center justify-between"
          style={{ color: primary, borderColor: borderTint }}
        >
          <span>
            <LiveEditableText
              value={termsTitle || 'Terms & Campus Guidelines'}
              editable={editable}
              onSave={val => onUpdateField?.('termsTitle', val)}
              className="inline-block"
            />
          </span>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: primary }}>
            BACK SIDE
          </span>
        </h4>

        <div className="grid grid-cols-2 gap-4 text-[9px] flex-1">
          <ul className="space-y-1 list-disc list-inside text-slate-600">
            {parsedGuidelines.map((item, idx) => (
              <li key={idx} className="leading-tight">
                <LiveEditableText
                  value={item}
                  editable={editable}
                  onSave={val => {
                    const next = [...parsedGuidelines]
                    next[idx] = val
                    onUpdateField?.('termsGuidelines', next.map(l => `• ${l}`).join('\n'))
                  }}
                  className="inline"
                />
              </li>
            ))}
          </ul>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="font-bold text-[9.5px]" style={{ color: primary }}>Campus Return Address:</p>
              <p className="text-[8.5px] text-slate-600 leading-relaxed mt-0.5">
                <LiveEditableText
                  value={schoolName}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolName', val)}
                  className="font-bold block"
                />
                <LiveEditableText
                  value={schoolAddress}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolAddress', val)}
                  className="inline-block"
                />
              </p>
            </div>
            <div className="text-[8px] text-slate-600 space-y-0.5 mt-2">
              <p>
                📞 Helpline:{' '}
                <LiveEditableText
                  value={schoolPhone}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolPhone', val)}
                  className="inline-block"
                />
              </p>
              <p>
                ✉️ Email:{' '}
                <LiveEditableText
                  value={schoolEmail}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolEmail', val)}
                  className="inline-block"
                />
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[8px] text-slate-500">
          <p className="italic max-w-[320px]">
            <LiveEditableText
              value={bottomNotes}
              editable={editable}
              onSave={val => onUpdateField?.('bottomNotes', val)}
              className="inline-block"
            />
          </p>
          <div className="h-5 flex items-end gap-[1.5px] px-1 bg-white border border-slate-200 rounded">
            {[2,1,3,1,2,1,2,3,1,2,1].map((w, idx) => (
              <div key={idx} className="h-full" style={{ width: `${w}px`, backgroundColor: primary }}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="w-[280px] h-[450px] rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border shrink-0 p-4 select-none text-slate-700"
      style={{ backgroundColor: tintLight, borderColor: borderTint }}
    >
      <div className="w-12 h-2.5 bg-black/10 rounded-full mx-auto mb-2 border border-slate-300"></div>

      <h4 
        className="font-black text-xs uppercase tracking-wider border-b pb-1 mb-3 text-center"
        style={{ color: primary, borderColor: borderTint }}
      >
        <LiveEditableText
          value={termsTitle || 'Terms & Campus Guidelines'}
          editable={editable}
          onSave={val => onUpdateField?.('termsTitle', val)}
          className="inline-block"
        />
      </h4>

      <ul className="space-y-2 text-[9.5px] text-slate-600 list-disc list-inside px-1 flex-1">
        {parsedGuidelines.map((item, idx) => (
          <li key={idx} className="leading-snug">
            <LiveEditableText
              value={item}
              editable={editable}
              onSave={val => {
                const next = [...parsedGuidelines]
                next[idx] = val
                onUpdateField?.('termsGuidelines', next.map(l => `• ${l}`).join('\n'))
              }}
              className="inline"
            />
          </li>
        ))}
      </ul>

      <div className="bg-white p-3 rounded-xl border border-slate-200 mb-3 space-y-1 shadow-2xs">
        <p className="font-bold text-[9px] uppercase tracking-wide" style={{ color: primary }}>
          Campus Return Address
        </p>
        <p className="text-[8.5px] text-slate-700 font-bold">
          <LiveEditableText
            value={schoolName}
            editable={editable}
            onSave={val => onUpdateField?.('schoolName', val)}
            className="inline-block"
          />
        </p>
        <p className="text-[8px] text-slate-500 leading-tight">
          <LiveEditableText
            value={schoolAddress}
            editable={editable}
            onSave={val => onUpdateField?.('schoolAddress', val)}
            className="inline-block"
          />
        </p>
        <div className="text-[8px] text-slate-600 pt-1 space-y-0.5">
          <p>
            📞 Phone:{' '}
            <LiveEditableText
              value={schoolPhone}
              editable={editable}
              onSave={val => onUpdateField?.('schoolPhone', val)}
              className="inline-block"
            />
          </p>
          <p>
            ✉️ Email:{' '}
            <LiveEditableText
              value={schoolEmail}
              editable={editable}
              onSave={val => onUpdateField?.('schoolEmail', val)}
              className="inline-block"
            />
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-2 text-center">
        <p className="text-[7.5px] text-slate-500 italic mb-1.5 leading-snug">
          <LiveEditableText
            value={bottomNotes}
            editable={editable}
            onSave={val => onUpdateField?.('bottomNotes', val)}
            className="inline-block"
          />
        </p>
        <div className="h-6 flex items-end justify-center gap-[1.5px] px-2 py-0.5 bg-white border border-slate-200 rounded mx-auto w-fit">
          {[2,1,3,1,2,1,2,3,1,2,1,3,2,1,2].map((w, idx) => (
            <div key={idx} className="h-full" style={{ width: `${w * 1.2}px`, backgroundColor: primary }}></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// 4 UNIFIED ID CARD DESIGNS (UNIVERSAL FOR STUDENTS, TEACHERS & EMPLOYEES)
// -------------------------------------------------------------
export const IdCardDesign1Vertical = StudentDesignVertical
export const IdCardDesign2Horizontal = StudentDesignHorizontal
export const IdCardDesign3Vertical = TeacherDesignVertical
export const IdCardDesign4Horizontal = EmployeeDesignHorizontal

// Backwards-compatibility exports
export const IdCardDesignBlue = StudentDesignVertical
export const IdCardDesignPink = TeacherDesignVertical
export const IdCardDesignPurple = StudentDesignHorizontal

export type IdCardRole = 'Student' | 'Teacher' | 'Employee' | 'Universal'

export interface RolePersona {
  name: string
  role: IdCardRole
  class: string
  designation?: string
  department?: string
  rollNo?: string
  admNo?: string
  empId?: string
  uniqueId?: string
  fatherName?: string
  qualification?: string
  workStation?: string
  dob?: string
  doj?: string
  bloodGroup: string
  phone: string
  emergencyContact?: string
  photo: string
  defaultTitle: string
  defaultTagline: string
  holderSignLabel: string
  holderSignName: string
}

export const ID_CARD_ROLE_PREVIEWS: Record<IdCardRole, RolePersona> = {
  Student: {
    name: 'AARAV SHARMA',
    role: 'Student',
    class: 'Class 10 - Sec A',
    rollNo: '24',
    admNo: 'AS-2024-1048',
    uniqueId: 'AS-2024-1048',
    fatherName: 'Rajesh Sharma',
    dob: '14/08/2010',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    defaultTitle: 'STUDENT IDENTITY CARD',
    defaultTagline: 'Center of Academic Excellence',
    holderSignLabel: 'Student Sign',
    holderSignName: 'Aarav S.'
  },
  Teacher: {
    name: 'DR. MEENAKSHI SUNDARAM',
    role: 'Teacher',
    class: 'Senior PGT Mathematics & HOD',
    designation: 'Senior PGT Mathematics & HOD',
    department: 'Science & Mathematics',
    empId: 'FAC-MATH-042',
    admNo: 'FAC-MATH-042',
    uniqueId: 'FAC-MATH-042',
    rollNo: 'Science & Math',
    qualification: 'M.Sc, M.Phil, Ph.D, B.Ed',
    fatherName: 'M.Sc, Ph.D, B.Ed',
    doj: '12-07-2018',
    dob: '12-07-2018',
    bloodGroup: 'AB+',
    phone: '+91 98112 34567',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    defaultTitle: 'FACULTY IDENTITY CARD',
    defaultTagline: 'Faculty of Senior Academics',
    holderSignLabel: 'Teacher Sign',
    holderSignName: 'Dr. Meenakshi'
  },
  Employee: {
    name: 'VIKRAM SINGH RATHORE',
    role: 'Employee',
    class: 'Administrative Officer',
    designation: 'Administrative Officer',
    department: 'Operations & Administration',
    empId: 'EMP-ADM-019',
    admNo: 'EMP-ADM-019',
    uniqueId: 'EMP-ADM-019',
    rollNo: 'Admin Block',
    workStation: 'Central Administration Block',
    fatherName: 'Central Admin Block',
    doj: '05-03-2020',
    dob: '05-03-2020',
    bloodGroup: 'A+',
    phone: '+91 97123 45678',
    emergencyContact: '+91 97123 99999',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    defaultTitle: 'STAFF IDENTITY CARD',
    defaultTagline: 'Campus Operations & Staff',
    holderSignLabel: 'Staff Sign',
    holderSignName: 'V.S. Rathore'
  },
  Universal: {
    name: 'AARAV SHARMA',
    role: 'Universal',
    class: 'Class 10 - A / Campus Staff',
    rollNo: '24',
    admNo: 'CIC-2025-1048',
    uniqueId: 'CIC-2025-1048',
    fatherName: 'Rajesh Sharma',
    dob: '14/08/2010',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    defaultTitle: 'INSTITUTE IDENTITY CARD',
    defaultTagline: 'Center of Academic Excellence',
    holderSignLabel: 'Holder Sign',
    holderSignName: 'Cardholder'
  }
}

export interface IdCardDesignOption {
  id: 1 | 2 | 3 | 4
  name: string
  tagline: string
  orientation: 'Vertical' | 'Horizontal'
  dimensions: string
  badge: string
  description: string
  accentColor: string
}

export const ID_CARD_DESIGNS: IdCardDesignOption[] = [
  {
    id: 1,
    name: 'Design 1: Modern Smart ID Card',
    tagline: 'Modern Smart ID Badge (Vertical)',
    orientation: 'Vertical',
    dimensions: '280 × 450 px',
    badge: 'Vertical Format',
    description: 'Clean curved header with institute emblem, portrait photo, admission/identity grid, QR code & signature',
    accentColor: '#0284c7',
  },
  {
    id: 2,
    name: 'Design 2: Academic Campus RFID Card',
    tagline: 'Academic Campus RFID Card (Horizontal)',
    orientation: 'Horizontal',
    dimensions: '450 × 280 px',
    badge: 'Horizontal Format',
    description: 'Full-width institute brand banner, photo on left, multi-column identity layout, RFID badge simulation & barcode',
    accentColor: '#047857',
  },
  {
    id: 3,
    name: 'Design 3: Executive Prestige ID Pass',
    tagline: 'Executive Prestige ID Pass (Vertical)',
    orientation: 'Vertical',
    dimensions: '280 × 450 px',
    badge: 'Vertical Format',
    description: 'Luxury gradient header with lanyard clip slot, royal circular gold-accented photo frame, structured high-contrast info & official stamp',
    accentColor: '#701a75',
  },
  {
    id: 4,
    name: 'Design 4: Corporate High-Tech Card',
    tagline: 'Corporate High-Tech Card (Horizontal)',
    orientation: 'Horizontal',
    dimensions: '450 × 280 px',
    badge: 'Horizontal Format',
    description: 'Modern tech dual-tone header, horizontal badge with gold microchip / RFID graphic, clean typography & verification QR',
    accentColor: '#2563eb',
  },
]

export const UniversalIdCardRender: React.FC<IdCardCustomProps & { designId?: number; cardFor?: IdCardRole | string }> = ({
  designId = 1,
  cardFor,
  ...props
}) => {
  const roleKey = (cardFor && cardFor in ID_CARD_ROLE_PREVIEWS ? cardFor : 'Student') as IdCardRole
  const personaData = ID_CARD_ROLE_PREVIEWS[roleKey]
  const mergedProps = {
    ...props,
    data: props.data || personaData
  }
  if (designId === 1) return <IdCardDesign1Vertical {...mergedProps} />
  if (designId === 2) return <IdCardDesign2Horizontal {...mergedProps} />
  if (designId === 3) return <IdCardDesign3Vertical {...mergedProps} />
  if (designId === 4) return <IdCardDesign4Horizontal {...mergedProps} />
  return <IdCardDesign1Vertical {...mergedProps} />
}

// =============================================================
// WEB & PINTEREST DESIGN 3: MINIMALIST GRADIENT SMART BADGE (VERTICAL)
// =============================================================
export const StudentDesignPinterestVertical: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'STUDENT IDENTITY PASS',
  tagline = 'Center of Academic Excellence',
  affiliationCode = 'CBSE-213089',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  showTopHeaderTagline = true,
  data
}) => {
  const student = {
    name: data?.name || 'AARAV SHARMA',
    class: data?.class || 'Class 10 - Sec A',
    rollNo: data?.rollNo || '24',
    admNo: data?.admNo || 'AS-2024-1048',
    fatherName: data?.fatherName || 'Rajesh Sharma',
    dob: data?.dob || '14/08/2010',
    bloodGroup: data?.bloodGroup || 'O+',
    phone: data?.phone || '+91 98765 43210',
    photo: data?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[280px] h-[450px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 text-slate-800 select-none">
      {/* Top Lanyard Slot Graphic */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white pt-2.5 pb-6 px-3 text-center relative shadow-sm">
        <div className="w-12 h-2.5 bg-black/35 rounded-full mx-auto mb-1 border border-white/20"></div>
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <div className="w-5 h-5 rounded-full bg-amber-400 text-indigo-950 flex items-center justify-center font-black text-[10px] shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-black text-[12.5px] tracking-tight uppercase leading-tight line-clamp-1">
            {schoolName}
          </h2>
        </div>
        {showTopHeaderTagline && (
          <p className="text-[7.5px] text-indigo-200 font-medium tracking-wide">
            {tagline} {affiliationCode && `• ${affiliationCode}`}
          </p>
        )}
        <p className="text-[7px] text-indigo-300/90 truncate">{schoolAddress}</p>

        {/* Floating Role Pill */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-[8.5px] px-3.5 py-0.5 rounded-full shadow-md tracking-wider uppercase border border-white/40">
          {title} • {session}
        </div>
      </div>

      {/* Main Card Body */}
      <div className="flex-1 flex flex-col items-center pt-5 px-3.5 relative bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/60">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Building2 className="w-48 h-48 text-indigo-950" />
          </div>
        )}

        {/* Student Photo with Active Status Ring */}
        <div className="relative mb-2 mt-0.5">
          <div className="w-22 h-22 rounded-2xl border-[2.5px] border-indigo-600 bg-white p-0.5 overflow-hidden shadow-md relative">
            <img 
              src={student.photo} 
              alt={student.name}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
          </div>
          {/* Active Badge Dot */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-900 text-indigo-100 font-bold text-[7px] px-2 py-0.2 rounded-full border border-indigo-700 whitespace-nowrap shadow-2xs">
            ROLL #{student.rollNo}
          </div>
        </div>

        {/* Student Name & Class */}
        <div className="text-center mt-1 mb-2">
          <h3 className="font-black text-sm text-slate-900 tracking-tight uppercase leading-tight line-clamp-1">
            {student.name}
          </h3>
          <div className="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-0.5 rounded-md bg-indigo-100/70 border border-indigo-200/80 text-indigo-900 text-[9px] font-black">
            <span>{student.class}</span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="w-full bg-white/90 border border-slate-200/90 rounded-xl p-2.5 shadow-2xs space-y-1.5 text-[8.5px]">
          <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-1">
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">ADMISSION NO</span>
              <span className="font-bold text-slate-800 font-mono text-[9px]">{student.admNo}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">FATHER'S NAME</span>
              <span className="font-bold text-slate-800 truncate block">{student.fatherName}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">DATE OF BIRTH</span>
              <span className="font-bold text-slate-800">{student.dob}</span>
            </div>
            {showBloodGroup && (
              <div>
                <span className="text-slate-400 font-semibold block text-[7px]">BLOOD GROUP</span>
                <span className="inline-block px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-700 font-black text-[8px]">
                  🩸 {student.bloodGroup}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Strip & Signatory */}
        <div className="w-full flex items-center justify-between mt-auto pt-2 border-t border-slate-200/80">
          {showQr && (
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                <QrCode className="w-7 h-7 text-indigo-950" />
              </div>
              <div className="text-[6.5px] leading-tight text-slate-500 font-mono">
                <div className="font-bold text-indigo-900">DIGITAL ID</div>
                <div>SCAN TO VERIFY</div>
              </div>
            </div>
          )}

          {showPrincipalSign && (
            <div className="text-right flex flex-col items-end">
              <div className="h-6 w-14 relative flex items-center justify-center">
                <span className="font-serif italic font-black text-indigo-950 text-[11px] rotate-[-5deg]">
                  Principal
                </span>
              </div>
              <p className="text-[6.5px] font-black text-slate-500 uppercase tracking-tighter">
                Authorized Signatory
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Security Strip */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white text-[7px] py-1 px-3 flex items-center justify-between font-mono">
        <span className="text-indigo-300">HELPLINE: {schoolPhone}</span>
        <span className="text-amber-400 font-bold">SESSION {session}</span>
      </div>
    </div>
  )
}

// =============================================================
// WEB & PINTEREST DESIGN 4: CORPORATE & COLLEGIATE RFID PASS (LANDSCAPE)
// =============================================================
export const StudentDesignPinterestHorizontal: React.FC<IdCardCustomProps> = ({
  schoolName = 'GLOBAL HERITAGE ACADEMY',
  schoolAddress = 'Campus Road, Civil Lines, Jaipur',
  schoolPhone = '+91 141 2789123',
  session = '2025-26',
  title = 'STUDENT IDENTITY PASS',
  tagline = 'Excellence in Education',
  affiliationCode = 'CBSE AFFIL NO. 1730452',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  data
}) => {
  const student = {
    name: data?.name || 'ANANYA VERMA',
    class: data?.class || 'Class VIII - Sec B',
    rollNo: data?.rollNo || '18',
    admNo: data?.admNo || 'GHA-2024-8842',
    fatherName: data?.fatherName || 'Vikram Verma',
    motherName: data?.motherName || 'Sunita Verma',
    dob: data?.dob || '22/11/2011',
    bloodGroup: data?.bloodGroup || 'B+',
    phone: data?.phone || '+91 98101 23456',
    photo: data?.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[450px] h-[280px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-row font-sans border border-slate-300 shrink-0 select-none">
      {/* Left Column: Asymmetrical Deep Tone Accent Panel */}
      <div className="w-[145px] bg-gradient-to-b from-[#064e3b] via-[#047857] to-[#022c22] text-white p-3 flex flex-col items-center justify-between relative shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none"></div>

        {/* Institution Logo / Emblem */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-sm mb-1">
            <Award className="w-5 h-5" />
          </div>
          <span className="font-black text-[9px] uppercase tracking-wider text-amber-300">CAMPUS PASS</span>
        </div>

        {/* Student Photo */}
        <div className="relative z-10 my-1">
          <div className="w-22 h-24 rounded-xl border-2 border-amber-400/90 p-0.5 bg-white shadow-md relative overflow-hidden">
            <img 
              src={student.photo} 
              alt={student.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-amber-400 text-emerald-950 text-[7px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider shadow-xs whitespace-nowrap">
            STUDENT
          </div>
        </div>

        {/* Gold RFID Chip Simulation Graphic */}
        <div className="w-full bg-emerald-950/70 border border-emerald-500/40 rounded-lg p-1.5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-4 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 rounded-[3px] border border-amber-200/60 flex items-center justify-center p-0.5 shadow-2xs">
              <div className="w-full h-full border border-amber-700/40 rounded-[1px] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full border border-amber-900/50"></div>
              </div>
            </div>
            <span className="text-[6.5px] font-mono tracking-widest text-emerald-200">SMART RFID</span>
          </div>
          <span className="text-[7px] font-black text-amber-400">{session}</span>
        </div>
      </div>

      {/* Right Column: Credentials & Institutional Info */}
      <div className="flex-1 p-3.5 flex flex-col justify-between relative bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/30">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Building2 className="w-52 h-52 text-emerald-950" />
          </div>
        )}

        {/* Header */}
        <div>
          <div className="flex items-start justify-between border-b border-emerald-100 pb-1.5 mb-2">
            <div>
              <h2 className="font-black text-[13px] text-emerald-950 uppercase tracking-tight leading-tight">
                {schoolName}
              </h2>
              <p className="text-[7.5px] text-slate-500 font-medium">
                {schoolAddress} • {affiliationCode}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-black text-[8px] tracking-wider uppercase border border-emerald-200 shrink-0">
              {title}
            </span>
          </div>

          {/* Student Name */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-black text-base text-slate-900 uppercase tracking-tight">
                {student.name}
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                {student.class}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[7.5px] text-slate-400 font-semibold block uppercase">Roll Number</span>
              <span className="font-black text-sm text-emerald-900">{student.rollNo}</span>
            </div>
          </div>

          {/* 2-Column Info Grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] bg-white/90 p-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">ADMISSION NO</span>
              <span className="font-bold text-slate-800 font-mono">{student.admNo}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">FATHER'S NAME</span>
              <span className="font-bold text-slate-800 truncate block">{student.fatherName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">DATE OF BIRTH</span>
              <span className="font-bold text-slate-800">{student.dob}</span>
            </div>
            {showBloodGroup && (
              <div>
                <span className="text-slate-400 font-semibold block text-[7px]">BLOOD GROUP</span>
                <span className="font-black text-rose-700 bg-rose-50 px-1 py-0.2 rounded text-[8px]">🩸 {student.bloodGroup}</span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-slate-400 font-semibold block text-[7px]">PARENT HELPLINE</span>
              <span className="font-bold text-slate-800">{student.phone}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Barcode, Hologram & Signature */}
        <div className="flex items-end justify-between pt-1 border-t border-slate-200/80 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="h-6 flex items-end gap-[1.5px] px-1 bg-white border border-slate-200 rounded">
              {[2,1,3,1,2,2,1,3,1,2,1,1,3,2,1].map((w, idx) => (
                <div key={idx} className="bg-slate-800 h-full" style={{ width: `${w * 1.1}px` }}></div>
              ))}
            </div>
            <span className="text-[7px] font-mono text-slate-400">{student.admNo}</span>
          </div>

          {showQr && (
            <div className="p-0.5 bg-white border border-slate-200 rounded shadow-2xs">
              <QrCode className="w-6 h-6 text-emerald-950" />
            </div>
          )}

          {showPrincipalSign && (
            <div className="text-right">
              <div className="h-5 flex items-center justify-end">
                <span className="font-serif italic font-black text-emerald-900 text-xs rotate-[-4deg]">
                  Principal.S
                </span>
              </div>
              <p className="text-[6.5px] font-black text-slate-500 uppercase tracking-tighter">
                Authorized Signatory
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================
// TEACHER PINTEREST DESIGN 3: EXECUTIVE FACULTY SMART BADGE (VERTICAL)
// =============================================================
export const TeacherDesignPinterestVertical: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'FACULTY IDENTITY CARD',
  tagline = 'Center for Higher Learning',
  affiliationCode = 'CBSE-213089',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  data
}) => {
  const teacher = {
    name: data?.name || 'DR. MEENAKSHI SUNDARAM',
    designation: data?.designation || 'Senior PGT Mathematics & HOD',
    department: data?.department || 'Department of Mathematics',
    empId: data?.empId || 'FAC-MATH-042',
    qualification: data?.qualification || 'M.Sc, M.Phil, Ph.D, B.Ed',
    experience: data?.experience || '15+ Years Service',
    bloodGroup: data?.bloodGroup || 'AB+',
    phone: data?.phone || '+91 98112 34567',
    email: data?.email || 'meenakshi@academy.edu',
    photo: data?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[280px] h-[450px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 text-slate-800 select-none">
      <div className="bg-gradient-to-br from-[#4a044e] via-[#701a75] to-[#86198f] text-white pt-2.5 pb-6 px-3 text-center relative shadow-sm">
        <div className="w-12 h-2.5 bg-black/35 rounded-full mx-auto mb-1 border border-white/20"></div>
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <div className="w-5 h-5 rounded-full bg-amber-400 text-fuchsia-950 flex items-center justify-center font-black text-[10px] shadow-xs">
            <Award className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-black text-[12.5px] tracking-tight uppercase leading-tight line-clamp-1">
            {schoolName}
          </h2>
        </div>
        <p className="text-[7.5px] text-fuchsia-200 font-medium tracking-wide">
          {tagline} • FACULTY CREDENTIAL
        </p>
        <p className="text-[7px] text-fuchsia-300/90 truncate">{schoolAddress}</p>

        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-black text-[8.5px] px-3.5 py-0.5 rounded-full shadow-md tracking-wider uppercase border border-white/40">
          {title} • {session}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center pt-5 px-3.5 relative bg-gradient-to-b from-fuchsia-50/40 via-white to-slate-50/60">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Building2 className="w-48 h-48 text-fuchsia-950" />
          </div>
        )}

        <div className="relative mb-2 mt-0.5">
          <div className="w-22 h-22 rounded-2xl border-[2.5px] border-fuchsia-700 bg-white p-0.5 overflow-hidden shadow-md relative">
            <img 
              src={teacher.photo} 
              alt={teacher.name}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-fuchsia-950 text-fuchsia-100 font-bold text-[7px] px-2 py-0.2 rounded-full border border-fuchsia-700 whitespace-nowrap shadow-2xs font-mono">
            {teacher.empId}
          </div>
        </div>

        <div className="text-center mt-1 mb-2">
          <h3 className="font-black text-sm text-slate-900 tracking-tight uppercase leading-tight line-clamp-1">
            {teacher.name}
          </h3>
          <div className="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-0.5 rounded-md bg-fuchsia-100/70 border border-fuchsia-200/80 text-fuchsia-950 text-[9px] font-black">
            <span>{teacher.designation}</span>
          </div>
        </div>

        <div className="w-full bg-white/90 border border-slate-200/90 rounded-xl p-2.5 shadow-2xs space-y-1.5 text-[8.5px]">
          <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-1">
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">DEPARTMENT</span>
              <span className="font-bold text-slate-800 truncate block">{teacher.department}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">QUALIFICATION</span>
              <span className="font-bold text-slate-800 truncate block">{teacher.qualification}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">OFFICIAL CONTACT</span>
              <span className="font-bold text-slate-800">{teacher.phone}</span>
            </div>
            {showBloodGroup && (
              <div>
                <span className="text-slate-400 font-semibold block text-[7px]">BLOOD GROUP</span>
                <span className="inline-block px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-700 font-black text-[8px]">
                  🩸 {teacher.bloodGroup}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex items-center justify-between mt-auto pt-2 border-t border-slate-200/80">
          {showQr && (
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                <QrCode className="w-7 h-7 text-fuchsia-950" />
              </div>
              <div className="text-[6.5px] leading-tight text-slate-500 font-mono">
                <div className="font-bold text-fuchsia-900">FACULTY AUTH</div>
                <div>SECURE VERIFY</div>
              </div>
            </div>
          )}

          {showPrincipalSign && (
            <div className="text-right flex flex-col items-end">
              <div className="h-6 w-14 relative flex items-center justify-center">
                <span className="font-serif italic font-black text-fuchsia-950 text-[11px] rotate-[-5deg]">
                  Director.A
                </span>
              </div>
              <p className="text-[6.5px] font-black text-slate-500 uppercase tracking-tighter">
                Director / Principal
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-fuchsia-950 via-slate-900 to-fuchsia-950 text-white text-[7px] py-1 px-3 flex items-center justify-between font-mono">
        <span className="text-fuchsia-300">CAMPUS FACULTY PASS</span>
        <span className="text-amber-400 font-bold">SESSION {session}</span>
      </div>
    </div>
  )
}

// =============================================================
// TEACHER PINTEREST DESIGN 4: PRESTIGE FACULTY RFID PASS (LANDSCAPE)
// =============================================================
export const TeacherDesignPinterestHorizontal: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'FACULTY IDENTITY CARD',
  tagline = 'Affiliated to CBSE, New Delhi',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  data
}) => {
  const teacher = {
    name: data?.name || 'PROF. RAJESH MALHOTRA',
    designation: data?.designation || 'HOD English & Linguistics',
    department: data?.department || 'Department of Languages',
    empId: data?.empId || 'FAC-ENG-108',
    qualification: data?.qualification || 'M.A., M.Phil., UGC-NET, B.Ed',
    experience: data?.experience || '12+ Years Experience',
    bloodGroup: data?.bloodGroup || 'A+',
    phone: data?.phone || '+91 98450 11223',
    email: data?.email || 'r.malhotra@academy.edu',
    photo: data?.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[450px] h-[280px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-row font-sans border border-slate-300 shrink-0 select-none">
      <div className="w-[145px] bg-gradient-to-b from-[#134e4a] via-[#0f766e] to-[#042f2e] text-white p-3 flex flex-col items-center justify-between relative shrink-0">
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-teal-950 flex items-center justify-center font-black shadow-sm mb-1">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-black text-[9px] uppercase tracking-wider text-amber-300">FACULTY CARD</span>
        </div>

        <div className="relative z-10 my-1">
          <div className="w-22 h-24 rounded-xl border-2 border-teal-400 p-0.5 bg-white shadow-md relative overflow-hidden">
            <img 
              src={teacher.photo} 
              alt={teacher.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[7px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider shadow-xs whitespace-nowrap">
            TEACHER
          </div>
        </div>

        <div className="w-full bg-teal-950/70 border border-teal-500/40 rounded-lg p-1.5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-4 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 rounded-[3px] border border-amber-200/60 flex items-center justify-center p-0.5 shadow-2xs">
              <div className="w-full h-full border border-amber-700/40 rounded-[1px] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full border border-amber-900/50"></div>
              </div>
            </div>
            <span className="text-[6.5px] font-mono tracking-widest text-teal-200">SMART RFID</span>
          </div>
          <span className="text-[7px] font-black text-amber-400">{session}</span>
        </div>
      </div>

      <div className="flex-1 p-3.5 flex flex-col justify-between relative bg-gradient-to-br from-white via-slate-50/50 to-teal-50/30">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Award className="w-52 h-52 text-teal-950" />
          </div>
        )}

        <div>
          <div className="flex items-start justify-between border-b border-teal-100 pb-1.5 mb-2">
            <div>
              <h2 className="font-black text-[13px] text-teal-950 uppercase tracking-tight leading-tight">
                {schoolName}
              </h2>
              <p className="text-[7.5px] text-slate-500 font-medium">
                {schoolAddress} • {tagline}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-black text-[8px] tracking-wider uppercase border border-teal-200 shrink-0">
              FACULTY PASS
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-black text-base text-slate-900 uppercase tracking-tight">
                {teacher.name}
              </h3>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.2 rounded border border-teal-200">
                {teacher.designation}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[7.5px] text-slate-400 font-semibold block uppercase">Faculty ID</span>
              <span className="font-black text-sm text-teal-900 font-mono">{teacher.empId}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] bg-white/90 p-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">DEPARTMENT</span>
              <span className="font-bold text-slate-800 truncate block">{teacher.department}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">QUALIFICATION</span>
              <span className="font-bold text-slate-800 truncate block">{teacher.qualification}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">CONTACT</span>
              <span className="font-bold text-slate-800">{teacher.phone}</span>
            </div>
            {showBloodGroup && (
              <div>
                <span className="text-slate-400 font-semibold block text-[7px]">BLOOD GROUP</span>
                <span className="font-black text-rose-700 bg-rose-50 px-1 py-0.2 rounded text-[8px]">🩸 {teacher.bloodGroup}</span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-slate-400 font-semibold block text-[7px]">OFFICIAL EMAIL</span>
              <span className="font-bold text-slate-800">{teacher.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between pt-1 border-t border-slate-200/80 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="h-6 flex items-end gap-[1.5px] px-1 bg-white border border-slate-200 rounded">
              {[1,2,3,2,1,2,1,3,2,1,1,2,3,1].map((w, idx) => (
                <div key={idx} className="bg-slate-800 h-full" style={{ width: `${w * 1.2}px` }}></div>
              ))}
            </div>
            <span className="text-[7px] font-mono text-slate-400">{teacher.empId}</span>
          </div>

          {showQr && (
            <div className="p-0.5 bg-white border border-slate-200 rounded shadow-2xs">
              <QrCode className="w-6 h-6 text-teal-950" />
            </div>
          )}

          {showPrincipalSign && (
            <div className="text-right">
              <div className="h-5 flex items-center justify-end">
                <span className="font-serif italic font-black text-teal-900 text-xs rotate-[-4deg]">
                  Prof.R.Gupta
                </span>
              </div>
              <p className="text-[6.5px] font-black text-slate-500 uppercase tracking-tighter">
                Authorized Signatory
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================
// EMPLOYEE PINTEREST DESIGN 3: CORPORATE STAFF SMART BADGE (VERTICAL)
// =============================================================
export const EmployeeDesignPinterestVertical: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'STAFF IDENTITY PASS',
  tagline = 'Institutional Administration',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  data
}) => {
  const staff = {
    name: data?.name || 'VIKRAM SINGH RATHORE',
    designation: data?.designation || 'Administrative Officer',
    department: data?.department || 'Administration & Accounts',
    empId: data?.empId || 'EMP-ADM-019',
    bloodGroup: data?.bloodGroup || 'A+',
    phone: data?.phone || '+91 97123 45678',
    workStation: data?.workStation || 'Admin Block, Ground Floor',
    photo: data?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[280px] h-[450px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 text-slate-800 select-none">
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white pt-2.5 pb-6 px-3 text-center relative shadow-sm">
        <div className="w-12 h-2.5 bg-black/35 rounded-full mx-auto mb-1 border border-white/20"></div>
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-black text-[12.5px] tracking-tight uppercase leading-tight line-clamp-1">
            {schoolName}
          </h2>
        </div>
        <p className="text-[7.5px] text-slate-300 font-medium tracking-wide">
          {tagline} • STAFF CREDENTIAL
        </p>
        <p className="text-[7px] text-slate-400 truncate">{schoolAddress}</p>

        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[8.5px] px-3.5 py-0.5 rounded-full shadow-md tracking-wider uppercase border border-white/40">
          {title} • {session}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center pt-5 px-3.5 relative bg-gradient-to-b from-slate-50/60 via-white to-blue-50/30">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Building2 className="w-48 h-48 text-slate-900" />
          </div>
        )}

        <div className="relative mb-2 mt-0.5">
          <div className="w-22 h-22 rounded-2xl border-[2.5px] border-blue-600 bg-white p-0.5 overflow-hidden shadow-md relative">
            <img 
              src={staff.photo} 
              alt={staff.name}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-100 font-bold text-[7px] px-2 py-0.2 rounded-full border border-slate-700 whitespace-nowrap shadow-2xs font-mono">
            {staff.empId}
          </div>
        </div>

        <div className="text-center mt-1 mb-2">
          <h3 className="font-black text-sm text-slate-900 tracking-tight uppercase leading-tight line-clamp-1">
            {staff.name}
          </h3>
          <div className="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 text-[9px] font-black">
            <span>{staff.designation}</span>
          </div>
        </div>

        <div className="w-full bg-white/90 border border-slate-200/90 rounded-xl p-2.5 shadow-2xs space-y-1.5 text-[8.5px]">
          <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-1">
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">DEPARTMENT</span>
              <span className="font-bold text-slate-800 truncate block">{staff.department}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">WORKSTATION</span>
              <span className="font-bold text-slate-800 truncate block">{staff.workStation}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">OFFICIAL CONTACT</span>
              <span className="font-bold text-slate-800">{staff.phone}</span>
            </div>
            {showBloodGroup && (
              <div>
                <span className="text-slate-400 font-semibold block text-[7px]">BLOOD GROUP</span>
                <span className="inline-block px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-700 font-black text-[8px]">
                  🩸 {staff.bloodGroup}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex items-center justify-between mt-auto pt-2 border-t border-slate-200/80">
          {showQr && (
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                <QrCode className="w-7 h-7 text-slate-900" />
              </div>
              <div className="text-[6.5px] leading-tight text-slate-500 font-mono">
                <div className="font-bold text-blue-900">SECURITY PASS</div>
                <div>CAMPUS GATE ALL</div>
              </div>
            </div>
          )}

          {showPrincipalSign && (
            <div className="text-right flex flex-col items-end">
              <div className="h-6 w-14 relative flex items-center justify-center">
                <span className="font-serif italic font-black text-slate-900 text-[11px] rotate-[-5deg]">
                  Registrar.S
                </span>
              </div>
              <p className="text-[6.5px] font-black text-slate-500 uppercase tracking-tighter">
                Registrar / Admin
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white text-[7px] py-1 px-3 flex items-center justify-between font-mono">
        <span className="text-slate-300">CAMPUS STAFF PASS</span>
        <span className="text-amber-400 font-bold">SESSION {session}</span>
      </div>
    </div>
  )
}

// =============================================================
// EMPLOYEE PINTEREST DESIGN 4: MODERN TECH RFID PASS (LANDSCAPE)
// =============================================================
export const EmployeeDesignPinterestHorizontal: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'STAFF IDENTITY PASS',
  tagline = 'Institutional Administration',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  data
}) => {
  const staff = {
    name: data?.name || 'VIKRAM SINGH RATHORE',
    designation: data?.designation || 'Administrative Officer',
    department: data?.department || 'Administration & Accounts',
    empId: data?.empId || 'EMP-ADM-019',
    bloodGroup: data?.bloodGroup || 'A+',
    phone: data?.phone || '+91 97123 45678',
    workStation: data?.workStation || 'Admin Block, Ground Floor',
    emergencyContact: data?.emergencyContact || '+91 98989 12345',
    photo: data?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[450px] h-[280px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-row font-sans border border-slate-300 shrink-0 select-none">
      <div className="w-[145px] bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#0f172a] text-white p-3 flex flex-col items-center justify-between relative shrink-0">
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black shadow-sm mb-1">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-black text-[9px] uppercase tracking-wider text-indigo-300">STAFF ACCESS</span>
        </div>

        <div className="relative z-10 my-1">
          <div className="w-22 h-24 rounded-xl border-2 border-indigo-400 p-0.5 bg-white shadow-md relative overflow-hidden">
            <img 
              src={staff.photo} 
              alt={staff.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[7px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider shadow-xs whitespace-nowrap">
            EMPLOYEE
          </div>
        </div>

        <div className="w-full bg-indigo-950/70 border border-indigo-500/40 rounded-lg p-1.5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-4 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 rounded-[3px] border border-amber-200/60 flex items-center justify-center p-0.5 shadow-2xs">
              <div className="w-full h-full border border-amber-700/40 rounded-[1px] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full border border-amber-900/50"></div>
              </div>
            </div>
            <span className="text-[6.5px] font-mono tracking-widest text-indigo-200">SMART RFID</span>
          </div>
          <span className="text-[7px] font-black text-amber-400">{session}</span>
        </div>
      </div>

      <div className="flex-1 p-3.5 flex flex-col justify-between relative bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Building2 className="w-52 h-52 text-indigo-950" />
          </div>
        )}

        <div>
          <div className="flex items-start justify-between border-b border-indigo-100 pb-1.5 mb-2">
            <div>
              <h2 className="font-black text-[13px] text-slate-900 uppercase tracking-tight leading-tight">
                {schoolName}
              </h2>
              <p className="text-[7.5px] text-slate-500 font-medium">
                {schoolAddress} • {tagline}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-black text-[8px] tracking-wider uppercase border border-indigo-200 shrink-0">
              STAFF PASS
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-black text-base text-slate-900 uppercase tracking-tight">
                {staff.name}
              </h3>
              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.2 rounded border border-indigo-200">
                {staff.designation}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[7.5px] text-slate-400 font-semibold block uppercase">Staff ID</span>
              <span className="font-black text-sm text-indigo-950 font-mono">{staff.empId}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] bg-white/90 p-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">DEPARTMENT</span>
              <span className="font-bold text-slate-800 truncate block">{staff.department}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">WORKSTATION</span>
              <span className="font-bold text-slate-800 truncate block">{staff.workStation}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[7px]">CONTACT</span>
              <span className="font-bold text-slate-800">{staff.phone}</span>
            </div>
            {showBloodGroup && (
              <div>
                <span className="text-slate-400 font-semibold block text-[7px]">BLOOD GROUP</span>
                <span className="font-black text-rose-700 bg-rose-50 px-1 py-0.2 rounded text-[8px]">🩸 {staff.bloodGroup}</span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-slate-400 font-semibold block text-[7px]">EMERGENCY CONTACT</span>
              <span className="font-bold text-slate-800">{staff.emergencyContact}</span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between pt-1 border-t border-slate-200/80 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="h-6 flex items-end gap-[1.5px] px-1 bg-white border border-slate-200 rounded">
              {[2,1,2,3,1,1,2,3,1,2,1,3,2,1].map((w, idx) => (
                <div key={idx} className="bg-slate-800 h-full" style={{ width: `${w * 1.2}px` }}></div>
              ))}
            </div>
            <span className="text-[7px] font-mono text-slate-400">{staff.empId}</span>
          </div>

          {showQr && (
            <div className="p-0.5 bg-white border border-slate-200 rounded shadow-2xs">
              <QrCode className="w-6 h-6 text-indigo-950" />
            </div>
          )}

          {showPrincipalSign && (
            <div className="text-right">
              <div className="h-5 flex items-center justify-end">
                <span className="font-serif italic font-black text-indigo-950 text-xs rotate-[-4deg]">
                  Registrar.S
                </span>
              </div>
              <p className="text-[6.5px] font-black text-slate-500 uppercase tracking-tighter">
                Authorized Signatory
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


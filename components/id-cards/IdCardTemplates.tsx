import React from 'react'
import { QrCode, ShieldCheck, Award, Building2, Phone, Mail, MapPin, Calendar, User, HeartPulse, CheckCircle2, Sparkles, Cpu } from 'lucide-react'
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
  themeColor?: string
  editable?: boolean
  customLabels?: Record<string, string>
  onUpdateField?: (field: string, value: string) => void
  onUpdateLabel?: (key: string, value: string) => void
  showQr?: boolean
  showWatermark?: boolean
  showPrincipalSign?: boolean
  showBloodGroup?: boolean
  showTopHeaderTagline?: boolean
  showWatermarkStamp?: boolean
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
  themeColor,
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel,
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
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

  const student = {
    name: data?.name || 'AARAV SHARMA',
    class: data?.class || 'Class 10 - A',
    rollNo: data?.rollNo || '24',
    admNo: data?.admNo || 'AS-2024-1048',
    fatherName: data?.fatherName || 'Rajesh Sharma',
    dob: data?.dob || '14/08/2010',
    bloodGroup: data?.bloodGroup || 'O+',
    phone: data?.phone || '+91 98765 43210',
    photo: data?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[280px] h-[450px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border shrink-0 text-slate-800 select-none" style={{ borderColor: borderTint }}>
      {/* Decorative Top Wave Header */}
      <div 
        className="relative text-white pt-3 pb-7 px-3 text-center shadow-md transition-colors"
        style={{ background: `linear-gradient(135deg, ${darkTone}, ${primary}, ${lightTone})` }}
      >
        {/* Lanyard Hole Graphic Simulation */}
        <div className="w-12 h-2.5 bg-black/25 rounded-full mx-auto mb-1 border border-white/20"></div>

        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black text-[10px] shadow-sm shrink-0">
            <Award className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-black text-[13px] tracking-tight uppercase leading-tight line-clamp-1 drop-shadow-sm">
            <LiveEditableText
              tag="span"
              value={schoolName}
              editable={editable}
              onSave={val => onUpdateField?.('schoolName', val)}
              className="inline-block"
            />
          </h2>
        </div>

        {showTopHeaderTagline && (
          <p className="text-[8px] text-white/90 font-medium tracking-wide">
            <LiveEditableText
              value={tagline}
              editable={editable}
              onSave={val => onUpdateField?.('tagline', val)}
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
        <p className="text-[7.5px] text-white/80 truncate">
          <LiveEditableText
            value={schoolAddress}
            editable={editable}
            onSave={val => onUpdateField?.('schoolAddress', val)}
            className="inline-block"
          />
        </p>

        {/* Role Pill */}
        <div 
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-white font-black text-[9px] px-3.5 py-0.5 rounded-full shadow-md tracking-wider uppercase border border-white/60 whitespace-nowrap"
          style={{ backgroundColor: primary }}
        >
          <LiveEditableText
            value={title}
            editable={editable}
            onSave={val => onUpdateField?.('title', val)}
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
      <div className="flex-1 flex flex-col items-center pt-5 px-4 relative">
        {/* Subtle Watermark */}
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <Building2 className="w-44 h-44 text-slate-900" />
          </div>
        )}

        {/* Student Photo */}
        <div className="relative mb-2 mt-1">
          <div 
            className="w-24 h-24 rounded-xl border-[2.5px] bg-slate-100 overflow-hidden shadow-md relative"
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
              <User className="w-10 h-10" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
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
          <span>•</span>
          <span>
            <LiveEditableText
              value={labels.rollNoLabel || 'Roll No:'}
              editable={editable}
              onSave={val => updateLabel('rollNoLabel', val)}
              className="inline-block mr-0.5"
            />
            {student.rollNo}
          </span>
        </div>

        {/* Details Grid */}
        <div className="w-full text-[10px] space-y-1 bg-slate-50/80 p-2 rounded-lg border border-slate-200/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">
              <LiveEditableText
                value={labels.admNoLabel || 'Adm No:'}
                editable={editable}
                onSave={val => updateLabel('admNoLabel', val)}
                className="inline-block"
              />
            </span>
            <span className="font-bold text-slate-800 font-mono">{student.admNo}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">
              <LiveEditableText
                value={labels.fatherNameLabel || "Father's Name:"}
                editable={editable}
                onSave={val => updateLabel('fatherNameLabel', val)}
                className="inline-block"
              />
            </span>
            <span className="font-bold text-slate-800 truncate max-w-[120px]">{student.fatherName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">
              <LiveEditableText
                value={labels.dobLabel || 'D.O.B:'}
                editable={editable}
                onSave={val => updateLabel('dobLabel', val)}
                className="inline-block"
              />
            </span>
            <span className="font-bold text-slate-800">{student.dob}</span>
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
              <span className="font-bold text-red-600 bg-red-50 px-1 rounded text-[9px]">{student.bloodGroup}</span>
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
            <span className="font-bold text-slate-800">{student.phone}</span>
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="bg-slate-100/90 border-t border-slate-200 px-3 py-2 flex items-center justify-between mt-auto relative z-10">
        {showQr ? (
          <div className="bg-white p-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1">
            <ProperQrCode className="w-8 h-8" color={primary} />
            <div className="text-[6.5px] text-slate-400 font-mono leading-none">
              <p>VERIFIED</p>
              <p>ID #{student.admNo.slice(-4)}</p>
            </div>
          </div>
        ) : <div />}

        {showPrincipalSign && (
          <div className="text-right flex flex-col items-end">
            {/* Stamp simulation */}
            <div className="h-6 w-16 relative flex items-center justify-center">
              <span className="font-serif italic font-black text-[11px] rotate-[-5deg] tracking-tight" style={{ color: primary }}>
                <LiveEditableText
                  value={principalName || 'M.Sharma'}
                  editable={editable}
                  onSave={val => onUpdateField?.('principalName', val)}
                  className="inline-block"
                />
              </span>
              <div className="absolute inset-0 border rounded-full rotate-[-12deg] pointer-events-none" style={{ borderColor: borderTint }}></div>
            </div>
            <p className="text-[7.5px] font-black text-slate-600 uppercase tracking-tighter">
              <LiveEditableText
                value={labels.principalSignLabel || 'Principal Signature'}
                editable={editable}
                onSave={val => updateLabel('principalSignLabel', val)}
                className="inline-block"
              />
            </p>
          </div>
        )}
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
  themeColor,
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel,
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
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
    <div className="w-[450px] h-[280px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border shrink-0 select-none" style={{ borderColor: borderTint }}>
      {/* Top Banner */}
      <div 
        className="text-white px-4 py-2 flex items-center justify-between border-b-2"
        style={{ 
          background: `linear-gradient(135deg, ${darkTone}, ${primary}, ${lightTone})`,
          borderColor: borderTint
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-sm shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wide leading-tight drop-shadow-sm">
              <LiveEditableText
                tag="span"
                value={schoolName}
                editable={editable}
                onSave={val => onUpdateField?.('schoolName', val)}
                className="inline-block"
              />
            </h2>
            <p className="text-[8px] text-white/90 font-medium">
              <LiveEditableText
                value={tagline}
                editable={editable}
                onSave={val => onUpdateField?.('tagline', val)}
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
        <div className="w-28 flex flex-col items-center justify-between shrink-0">
          <div 
            className="w-24 h-28 rounded-xl border-2 p-0.5 bg-white shadow-md relative"
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
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9.5px]">
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
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-end justify-between pt-1 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-2">
              {/* Simulated Barcode */}
              <div className="h-6 flex items-end gap-[1.5px] px-1 bg-white border border-slate-200 rounded">
                {[1,2,1,3,1,2,1,1,3,2,1,2,3,1,2,1,3,1].map((w, idx) => (
                  <div key={idx} className="h-full" style={{ width: `${w * 1.2}px`, backgroundColor: primary }}></div>
                ))}
              </div>
              <span className="text-[7.5px] font-mono text-slate-400">{student.admNo}</span>
            </div>

            {showPrincipalSign && (
              <div className="text-right">
                <div className="h-5 flex items-center justify-end">
                  <span className="font-serif italic font-black text-xs rotate-[-4deg]" style={{ color: primary }}>
                    <LiveEditableText
                      value={principalName || 'K.Singhal'}
                      editable={editable}
                      onSave={val => onUpdateField?.('principalName', val)}
                      className="inline-block"
                    />
                  </span>
                </div>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
                  <LiveEditableText
                    value={labels.principalSignLabel || 'Principal Signature'}
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
        <span>
          If found, return to school office • Tel:{' '}
          <LiveEditableText
            value={schoolPhone}
            editable={editable}
            onSave={val => onUpdateField?.('schoolPhone', val)}
            className="inline-block"
          />
        </span>
        <span className="font-semibold text-amber-300">
          <LiveEditableText
            value={title}
            editable={editable}
            onSave={val => onUpdateField?.('title', val)}
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
  showBloodGroup = true,
  showTopHeaderTagline = true,
  themeColor,
  principalName,
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
  const labels = customLabels || {}

  const updateLabel = (key: string, val: string) => {
    onUpdateLabel?.(key, val)
  }

  const teacher = {
    name: data?.name || 'DR. MEENAKSHI SUNDARAM',
    designation: data?.designation || 'Senior PGT Mathematics & HOD',
    department: data?.department || 'Science & Mathematics',
    empId: data?.empId || 'FAC-MATH-042',
    qualification: data?.qualification || 'M.Sc, M.Phil, Ph.D, B.Ed',
    doj: data?.doj || '12-07-2018',
    bloodGroup: data?.bloodGroup || 'AB+',
    phone: data?.phone || '+91 98112 34567',
    email: data?.email || 'meenakshi@academy.edu',
    photo: data?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[280px] h-[450px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 text-slate-800 select-none">
      {/* Luxury Royal Header */}
      <div 
        className="relative text-white pt-3 pb-8 px-3 text-center shadow-md"
        style={{
          background: `linear-gradient(135deg, ${darkTone} 0%, ${primary} 55%, ${lightTone} 100%)`
        }}
      >
        {/* Lanyard Hole Clip */}
        <div className="w-12 h-2.5 bg-black/25 rounded-full mx-auto mb-1 border border-white/20"></div>

        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <div 
            className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-black text-[10px] shadow-sm"
            style={{ color: primary }}
          >
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-black text-[13px] tracking-tight uppercase leading-tight line-clamp-1 drop-shadow-sm">
            <LiveEditableText
              value={schoolName}
              editable={editable}
              onSave={val => onUpdateField?.('schoolName', val)}
              className="inline-block"
            />
          </h2>
        </div>

        {showTopHeaderTagline && (
          <p className="text-[8px] text-white/90 font-semibold tracking-wider uppercase">
            <LiveEditableText
              value={tagline}
              editable={editable}
              onSave={val => onUpdateField?.('tagline', val)}
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
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-white font-black text-[9px] px-3.5 py-0.5 rounded-full shadow-md tracking-wider uppercase border border-white"
          style={{ backgroundColor: primary }}
        >
          <LiveEditableText
            value={title}
            editable={editable}
            onSave={val => onUpdateField?.('title', val)}
            className="inline-block"
          />
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center pt-5 px-4 relative">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Award className="w-48 h-48 text-slate-900" />
          </div>
        )}

        {/* Faculty Photo */}
        <div className="relative mb-2 mt-1">
          <div 
            className="w-24 h-24 rounded-full border-[3px] bg-slate-50 p-0.5 shadow-md relative overflow-hidden"
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
              <User className="w-10 h-10" />
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
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-3 py-2 flex items-center justify-between mt-auto relative z-10">
        {showQr ? (
          <div className="bg-white p-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1.5">
            <ProperQrCode className="w-8 h-8" color={primary} />
            <div className="text-[6.5px] font-mono leading-none" style={{ color: primary }}>
              <p>BIOMETRIC</p>
              <p className="font-bold">VERIFIED</p>
            </div>
          </div>
        ) : <div />}

        {showPrincipalSign && (
          <div className="text-right flex flex-col items-end">
            <div className="h-6 w-20 relative flex items-center justify-center">
              <span className="font-serif italic font-black text-[12px] rotate-[-4deg]" style={{ color: primary }}>
                <LiveEditableText
                  value={principalName || 'Director.A'}
                  editable={editable}
                  onSave={val => onUpdateField?.('principalName', val)}
                  className="inline-block"
                />
              </span>
              <div 
                className="absolute inset-0 border rounded-full rotate-[6deg] pointer-events-none opacity-40"
                style={{ borderColor: primary }}
              ></div>
            </div>
            <p className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">
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
            <h2 className="font-black text-sm uppercase tracking-wide leading-tight drop-shadow-sm">
              <LiveEditableText
                value={schoolName}
                editable={editable}
                onSave={val => onUpdateField?.('schoolName', val)}
                className="inline-block"
              />
            </h2>
            <p className="text-[8px] text-white/90 font-medium">
              <LiveEditableText
                value={tagline}
                editable={editable}
                onSave={val => onUpdateField?.('tagline', val)}
                className="inline-block"
              />
              {' '}• CAMPUS ID
            </p>
          </div>
        </div>
        <div className="text-right">
          <span 
            className="font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs text-white"
            style={{ backgroundColor: primary }}
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
          <h2 className="font-black text-[13px] tracking-tight uppercase leading-tight line-clamp-1 drop-shadow-sm">
            <LiveEditableText
              value={schoolName}
              editable={editable}
              onSave={val => onUpdateField?.('schoolName', val)}
              className="inline-block"
            />
          </h2>
        </div>

        {showTopHeaderTagline && (
          <p className="text-[8px] text-white/90 font-semibold tracking-wider uppercase">
            <LiveEditableText
              value={tagline}
              editable={editable}
              onSave={val => onUpdateField?.('tagline', val)}
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
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-white font-black text-[9px] px-3.5 py-0.5 rounded-full shadow-md tracking-wider uppercase border border-white"
          style={{ backgroundColor: primary }}
        >
          <LiveEditableText
            value={title}
            editable={editable}
            onSave={val => onUpdateField?.('title', val)}
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
  showBloodGroup = true,
  themeColor,
  principalName,
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
  const labels = customLabels || {}

  const updateLabel = (key: string, val: string) => {
    onUpdateLabel?.(key, val)
  }

  const staff = {
    name: data?.name || 'SURESH KUMAR YADAV',
    designation: data?.designation || 'Senior Lab & Systems Incharge',
    department: data?.department || 'IT & Campus Infrastructure',
    empId: data?.empId || 'EMP-TECH-055',
    workStation: data?.workStation || 'Central Computer Lab - Block B',
    bloodGroup: data?.bloodGroup || 'O+',
    phone: data?.phone || '+91 96543 21098',
    emergencyContact: data?.emergencyContact || '+91 96543 21099',
    photo: data?.photo || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[450px] h-[280px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 select-none">
      {/* Top Banner */}
      <div 
        className="text-white px-4 py-2 flex items-center justify-between border-b-2"
        style={{
          background: `linear-gradient(90deg, ${darkTone} 0%, ${adjustHex(primary, -20)} 40%, ${primary} 100%)`,
          borderBottomColor: lightTone
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-black shadow-sm"
            style={{ color: primary }}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wide leading-tight drop-shadow-sm">
              <LiveEditableText
                value={schoolName}
                editable={editable}
                onSave={val => onUpdateField?.('schoolName', val)}
                className="inline-block"
              />
            </h2>
            <p className="text-[8px] text-white/90 font-medium">
              <LiveEditableText
                value={tagline}
                editable={editable}
                onSave={val => onUpdateField?.('tagline', val)}
                className="inline-block"
              />
              {' '}• STAFF CREDENTIAL
            </p>
          </div>
        </div>
        <div className="text-right">
          <span 
            className="font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs text-white"
            style={{ backgroundColor: primary }}
          >
            STAFF PASS • {session}
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
        <div className="w-28 flex flex-col items-center justify-between shrink-0">
          <div 
            className="w-24 h-28 rounded-xl border-2 p-0.5 bg-white shadow-md relative"
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
                <span className="font-bold text-slate-800 truncate block">{staff.department}</span>
              </div>
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
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-end justify-between pt-1 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-2">
              <div className="h-6 flex items-end gap-[1.5px] px-1 bg-white border border-slate-200 rounded">
                {[1,3,1,2,2,1,3,1,2,1,1,3,2,1].map((w, idx) => (
                  <div key={idx} className="h-full" style={{ width: `${w * 1.3}px`, backgroundColor: primary }}></div>
                ))}
              </div>
              <span className="text-[7.5px] font-mono text-slate-400">{staff.empId}</span>
            </div>

            {showPrincipalSign && (
              <div className="text-right">
                <div className="h-5 flex items-center justify-end">
                  <span className="font-serif italic font-black text-xs rotate-[-4deg]" style={{ color: primary }}>
                    <LiveEditableText
                      value={principalName || 'Registrar.S'}
                      editable={editable}
                      onSave={val => onUpdateField?.('principalName', val)}
                      className="inline-block"
                    />
                  </span>
                </div>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
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
export const IdCardBackDesign: React.FC<{
  orientation?: 'portrait' | 'landscape'
  schoolName?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  bottomNotes?: string
  themeColor?: string
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
  editable = false,
  onUpdateField
}) => {
  const primary = themeColor || '#1e3a8a'
  const borderTint = hexToRgba(primary, 0.25)
  const tintLight = hexToRgba(primary, 0.05)

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
          <span>Terms & Campus Guidelines</span>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: primary }}>
            BACK SIDE
          </span>
        </h4>

        <div className="grid grid-cols-2 gap-4 text-[9px] flex-1">
          <ul className="space-y-1 list-disc list-inside text-slate-600">
            <li>Must be displayed visibly at all times within campus.</li>
            <li>Non-transferable; strict action for fraudulent use.</li>
            <li>Loss must be reported immediately to school authorities.</li>
            <li>Replacement charges applicable for re-issuance.</li>
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
        Terms & Campus Guidelines
      </h4>

      <ul className="space-y-2 text-[9.5px] text-slate-600 list-disc list-inside px-1 flex-1">
        <li>This card is non-transferable and remains the property of the institute.</li>
        <li>Must be worn visibly during school/campus hours.</li>
        <li>Loss of this card should be reported to the office immediately.</li>
        <li>Damage or misuse of the card is strictly prohibited.</li>
        <li>Valid only for authorized campus access and library services.</li>
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
// BACKWARDS-COMPATIBILITY EXPORTS
// -------------------------------------------------------------
export const IdCardDesignBlue = StudentDesignVertical
export const IdCardDesignPink = TeacherDesignVertical
export const IdCardDesignPurple = StudentDesignHorizontal

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


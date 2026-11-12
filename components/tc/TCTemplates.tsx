'use client'

import React from 'react'
import { QrCode, Award, ShieldCheck, CheckCircle2, User, FileText, Check, Stamp } from 'lucide-react'
import { LiveEditableText } from '@/components/admit-card/AdmitCardModalPreview'

export function hexToRgba(hex?: string, alpha: number = 1): string {
  if (!hex) return `rgba(30, 58, 138, ${alpha})`
  let c = hex.trim().replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  if (isNaN(num)) return `rgba(30, 58, 138, ${alpha})`
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

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

export const TC_COLOR_PRESETS = [
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Sky Blue', hex: '#0284C7' },
  { name: 'Ocean Teal', hex: '#005D5B' },
  { name: 'Royal Emerald', hex: '#065F46' },
  { name: 'Amber Gold', hex: '#B45309' },
  { name: 'Burgundy', hex: '#660033' },
  { name: 'Crimson', hex: '#991B1B' },
  { name: 'Indigo', hex: '#4338CA' },
  { name: 'Plum Purple', hex: '#701A75' },
  { name: 'Midnight Slate', hex: '#0F172A' }
]

export interface TCFieldItem {
  num: string
  label: string
  hindiLabel?: string
  value: string
}

export interface TCCustomProps {
  title?: string
  subtitle?: string
  themeColor?: string
  schoolName?: string
  schoolAddress?: string
  schoolEmail?: string
  schoolPhone?: string
  schoolLogo?: string
  affiliationBoard?: string
  schoolCode?: string
  affiliationNo?: string
  udiseCode?: string
  tcNo?: string
  serialNo?: string
  admissionNo?: string
  studentName?: string
  studentAvatar?: string
  fatherName?: string
  motherName?: string
  nationality?: string
  casteCategory?: string
  dobFigures?: string
  dobWords?: string
  admissionDateClass?: string
  lastClassStudied?: string
  schoolBoardExamResult?: string
  failedStatus?: string
  subjectsStudied?: string
  promotionQualified?: string
  duesPaidMonth?: string
  feeConcession?: string
  totalWorkingDays?: string
  totalDaysPresent?: string
  nccCadetStatus?: string
  gamesActivities?: string
  generalConduct?: string
  dateOfApplication?: string
  dateOfIssue?: string
  reasonForLeaving?: string
  anyOtherRemarks?: string
  principalName?: string
  principalSignLabel?: string
  teacherSignLabel?: string
  preparedBySignLabel?: string
  checkedBySignLabel?: string

  // Dynamic Typography & Sizing Studio Fields
  logoSize?: number | string
  schoolNameFontSize?: number | string
  titleFontSize?: number | string
  subtitleFontSize?: number | string
  bodyFontSize?: number | string
  stampSize?: number | string
  photoSize?: number | string
  qrSize?: number | string

  // Visibility Toggles
  showLogo?: boolean
  showPhoto?: boolean
  showStamp?: boolean
  showWatermark?: boolean
  showQrCode?: boolean
  sampleMode?: boolean

  // Interactive Live Canvas Editing
  editable?: boolean
  onUpdateField?: (field: string, value: string) => void
  onUpdateLabel?: (key: string, value: string) => void
}

// ============================================================================
// TEMPLATE 1: AUTHENTIC INDIAN CBSE TRANSFER CERTIFICATE (Exact Image 2)
// Exact layout of Indian CBSE School TC (e.g. Indian School Al Seeb format):
// Crest on left, School Name, Affiliation, 25 Numbered Ruled Points,
// Declaration Paragraph, and Blue Circular Seal Stamp
// ============================================================================
export function TCTemplate1(props: TCCustomProps) {
  const primary = props.themeColor || '#1E3A8A'
  const schoolName = props.schoolName || 'COSMOPOLITAN INTER COLLEGE'
  const schoolAddress = props.schoolAddress || 'Knowledge Park, Sector 62, New Delhi, India - 110001'

  // Dynamic Sizing Attributes
  const logoSize = Number(props.logoSize) || 68
  const schoolNameFontSize = Number(props.schoolNameFontSize) || 24
  const titleFontSize = Number(props.titleFontSize) || 20
  const subtitleFontSize = Number(props.subtitleFontSize) || 10
  const bodyFontSize = Number(props.bodyFontSize) || 10
  const stampSize = Number(props.stampSize) || 76

  const points: { num: string; label: string; val: string; key?: string }[] = [
    { num: '1', label: 'Name of the Student', val: props.studentName || 'Aarav Sharma', key: 'studentName' },
    { num: '2', label: "Mother's Name", val: props.motherName || 'Mrs. Sunita Sharma', key: 'motherName' },
    { num: '3', label: "Father's / Guardian's Name", val: props.fatherName || 'Mr. Rajesh Sharma', key: 'fatherName' },
    { num: '4', label: 'Gender', val: 'Male' },
    { num: '5', label: 'Date of Birth as per School records (According to Christian era, in words & figures)', val: `${props.dobFigures || '15/08/2012'} (${props.dobWords || 'Fifteenth August Two Thousand Twelve'})`, key: 'dobFigures' },
    { num: '6', label: 'Proof for Date of Birth submitted at the time of admission', val: 'Birth Certificate / Transfer Certificate' },
    { num: '7', label: 'Nationality / Religion', val: `${props.nationality || 'Indian'} / Hindu` },
    { num: '8', label: 'Whether the candidate belongs to Scheduled Caste or Scheduled Tribe or OBC', val: props.casteCategory || 'General' },
    { num: '9', label: 'Date of first admission in the School with Class', val: props.admissionDateClass || '04-04-2018 in Class I' },
    { num: '10', label: 'Class in which the pupil last studied (in figures & words)', val: props.lastClassStudied || 'Class VII (Seventh)', key: 'lastClassStudied' },
    { num: '11', label: 'School / Board Annual Examination last taken with result', val: props.schoolBoardExamResult || 'Passed Annual Examination 2026' },
    { num: '12', label: 'Whether failed, if so once / twice in the same class', val: props.failedStatus || 'No' },
    { num: '13', label: 'Subjects Studied', val: props.subjectsStudied || '1. English, 2. Hindi, 3. Mathematics, 4. Science, 5. Social Science, 6. Computer' },
    { num: '14', label: 'Conduct in the school', val: props.generalConduct || 'Good', key: 'generalConduct' },
    { num: '15', label: 'Whether qualified for promotion to the higher class if so, to which class (in figures & words)', val: props.promotionQualified || 'Yes, Promoted to Class VIII (Eighth)' },
    { num: '16', label: 'Total No. of working days / Total No. of presence out of total working days in the academic session', val: `${props.totalDaysPresent || '204'} / ${props.totalWorkingDays || '218'} Days` },
    { num: '17', label: 'Month upto which the pupil has paid school fees', val: props.duesPaidMonth || 'March 2026' },
    { num: '18', label: 'Any fee concession availed of, if so, the nature of such concession', val: props.feeConcession || 'No' },
    { num: '19', label: 'Whether NCC Cadet, Boy Scout / Girl Guide (details may be given)', val: props.nccCadetStatus || 'NCC Junior Cadet' },
    { num: '20', label: 'Games played or extra-curricular activities in which the pupil usually took part', val: props.gamesActivities || 'Inter-School Badminton Champion & Debate Club' },
    { num: '21', label: 'Whether school is under Govt. / Minority / Independent Category', val: 'Independent Category' },
    { num: '22', label: 'Date of application for certificate', val: props.dateOfApplication || '25-03-2026' },
    { num: '23', label: 'Date on which pupil’s name was struck off the rolls of the school', val: '31-03-2026' },
    { num: '24', label: 'Date of issue of certificate', val: props.dateOfIssue || '31-03-2026', key: 'dateOfIssue' },
    { num: '25', label: 'Any other remarks', val: props.anyOtherRemarks || 'All institutional dues cleared. Character is good.', key: 'reasonForLeaving' },
  ]

  return (
    <div className="w-[780px] bg-white text-slate-900 p-8 flex flex-col font-serif relative shadow-md select-none border border-slate-300">
      
      {/* School Header (Exact Image 2) */}
      <div className="flex items-start gap-4 pb-3 border-b-2" style={{ borderColor: primary }}>
        
        {/* Left School Crest Shield (Customizable Size & Logo) */}
        {props.showLogo !== false && (
          <div 
            className="rounded border-2 flex flex-col items-center justify-center p-1 shrink-0 bg-amber-50/50 overflow-hidden"
            style={{ 
              borderColor: primary, 
              width: `${logoSize}px`, 
              height: `${Math.round(logoSize * 1.05)}px` 
            }}
          >
            {props.schoolLogo ? (
              <img src={props.schoolLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <Award style={{ color: primary, width: `${logoSize * 0.45}px`, height: `${logoSize * 0.45}px` }} />
                <span className="font-sans font-black uppercase tracking-wider text-slate-700 mt-0.5" style={{ fontSize: `${Math.max(6, logoSize * 0.11)}px` }}>
                  CREST
                </span>
              </div>
            )}
          </div>
        )}

        {/* School Name & Affiliation (Customizable Font Sizes) */}
        <div className="flex-1 text-center pr-6">
          <div className="font-bold text-slate-500 tracking-wide font-sans mb-0.5" style={{ fontSize: `${Math.max(9, subtitleFontSize)}px` }}>
            केंद्रीय माध्यमिक शिक्षा बोर्ड से सम्बद्ध • AFFILIATED TO CBSE
          </div>
          <LiveEditableText 
            tag="h1"
            value={schoolName}
            editable={props.editable}
            onSave={(val) => props.onUpdateField?.('schoolName', val)}
            className="font-black uppercase tracking-wider leading-tight" 
            style={{ color: primary, fontSize: `${schoolNameFontSize}px` }}
          />
          <p className="font-sans text-slate-600 mt-0.5" style={{ fontSize: `${subtitleFontSize}px` }}>
            <LiveEditableText
              tag="span"
              value={schoolAddress}
              editable={props.editable}
              onSave={(val) => props.onUpdateField?.('schoolAddress', val)}
            /> &bull; Tel: {props.schoolPhone || '+91 11 2659 0000'} &bull; Email: {props.schoolEmail || 'principal@cosmopolitan.edu.in'}
          </p>
          <p className="font-sans font-bold text-slate-700 mt-0.5" style={{ fontSize: `${subtitleFontSize}px` }}>
            Affiliated to the Central Board of Secondary Education, New Delhi, India
          </p>
          <p className="font-sans font-bold" style={{ color: primary, fontSize: `${subtitleFontSize}px` }}>
            (Affiliation No. {props.affiliationNo || '2130048'}, School Code: {props.schoolCode || '0012'}, UDISE: {props.udiseCode || '09123456789'})
          </p>
        </div>
      </div>

      {/* Title (Customizable Font Size) */}
      <div className="text-center my-3">
        <LiveEditableText 
          tag="h2"
          value={props.title || 'TRANSFER CERTIFICATE'}
          editable={props.editable}
          onSave={(val) => props.onUpdateField?.('title', val)}
          className="font-black uppercase tracking-widest text-slate-900 underline underline-offset-4 decoration-2" 
          style={{ textDecorationColor: primary, fontSize: `${titleFontSize}px` }}
        />
      </div>

      {/* Sub-Header Metadata Grid (Image 2) */}
      <div className="grid grid-cols-3 gap-y-1 font-sans font-bold text-slate-800 mb-3 px-1 pb-2 border-b border-slate-200" style={{ fontSize: `${bodyFontSize}px` }}>
        <div>Affiliation No.: <span className="font-black text-slate-950">{props.affiliationNo || '2130048'}</span></div>
        <div className="text-center">School Code: <span className="font-black text-slate-950">{props.schoolCode || '0012'}</span></div>
        <div className="text-right">TC No.: <span className="font-black" style={{ color: primary }}>{props.tcNo || 'TC/2026/1042'}</span></div>
        
        <div>Book No.: <span className="font-black text-slate-950">{props.serialNo || '04'}</span></div>
        <div className="text-center">Sl. No.: <span className="font-black text-slate-950">1042</span></div>
        <div className="text-right">Admission No. (Gr. No.): <span className="font-black" style={{ color: primary }}>{props.admissionNo || 'ADM/2018/092'}</span></div>
      </div>

      {/* 25 Numbered Rows (Image 2 - Fully Reactive Body Font Size) */}
      <div className="space-y-1 font-sans flex-1 mb-4" style={{ fontSize: `${bodyFontSize}px` }}>
        {points.map((pt) => (
          <div key={pt.num} className="flex items-end leading-none py-0.5">
            <span className="w-5 text-slate-500 font-bold shrink-0">{pt.num}.</span>
            <span className="w-96 text-slate-800 font-medium shrink-0 leading-tight">{pt.label}</span>
            <span className="px-1 text-slate-400 font-bold shrink-0">:</span>
            <span className="flex-1 font-bold text-slate-950 border-b border-dotted border-slate-400 pl-2 leading-none pb-0.5 min-h-[14px]">
              <LiveEditableText
                value={pt.val || '—'}
                editable={props.editable}
                onSave={(val) => {
                  if (pt.key) props.onUpdateField?.(pt.key, val)
                }}
              />
            </span>
          </div>
        ))}
      </div>

      {/* Official Declaration Paragraph (Exact Image 2) */}
      <div className="font-sans text-slate-700 italic border-t border-slate-200 pt-2 mb-4 leading-normal" style={{ fontSize: `${Math.max(8.5, bodyFontSize - 1)}px` }}>
        I hereby declare that the above information including Name of the Student, Father&apos;s Name, Mother&apos;s Name and Date of Birth furnished above is correct as per the official school admission register and examination records.
      </div>

      {/* Bottom Signatures with Official Blue Stamp (Customizable Stamp Size) */}
      <div className="flex items-end justify-between font-sans font-bold text-slate-700 pt-1" style={{ fontSize: `${bodyFontSize}px` }}>
        <div className="space-y-1">
          <div>Date: <span className="font-black text-slate-900">
            <LiveEditableText
              value={props.dateOfIssue || '31/03/2026'}
              editable={props.editable}
              onSave={(val) => props.onUpdateField?.('dateOfIssue', val)}
            />
          </span></div>
          <div className="text-slate-400 text-[8.5px]">Place: New Delhi</div>
        </div>

        {/* Circular Blue School Rubber Stamp (Customizable Size) */}
        {props.showStamp !== false && (
          <div className="flex flex-col items-center">
            <div 
              className="rounded-full border-2 border-double border-blue-700 p-1 flex flex-col items-center justify-center text-center text-blue-800 rotate-[-8deg] shadow-2xs select-none"
              style={{ width: `${stampSize}px`, height: `${stampSize}px` }}
            >
              <div className="font-black uppercase tracking-wider leading-none truncate w-full" style={{ fontSize: `${Math.max(5, stampSize * 0.08)}px` }}>
                ★ {schoolName.slice(0, 16)} ★
              </div>
              <Award style={{ color: '#1d4ed8', width: `${stampSize * 0.25}px`, height: `${stampSize * 0.25}px` }} />
              <div className="font-black uppercase" style={{ fontSize: `${Math.max(4.5, stampSize * 0.07)}px` }}>
                SEAL / STAMP
              </div>
              <div className="font-bold" style={{ fontSize: `${Math.max(4, stampSize * 0.065)}px` }}>
                DATE: {props.dateOfIssue || '31-03-2026'}
              </div>
            </div>
            <span className="text-slate-400 font-bold mt-1" style={{ fontSize: `${Math.max(7, stampSize * 0.1)}px` }}>
              Official School Seal
            </span>
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className="w-28 h-0.5 border-t border-slate-400 mb-1"></div>
          <span>
            <LiveEditableText
              value={props.checkedBySignLabel || 'Checked By'}
              editable={props.editable}
              onSave={(val) => props.onUpdateLabel?.('checkedBySign', val)}
            />
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-32 h-0.5 border-t-2 mb-1" style={{ borderColor: primary }}></div>
          <span className="font-black" style={{ color: primary }}>
            <LiveEditableText
              value={props.principalSignLabel || 'Signature of Principal'}
              editable={props.editable}
              onSave={(val) => props.onUpdateLabel?.('principalSign', val)}
            />
          </span>
        </div>
      </div>

    </div>
  )
}

// ============================================================================
// TEMPLATE 2: MODERN WAVE / CURVED RIBBON CERTIFICATE (Exact Image 1)
// Clean contemporary certificate with arched golden wave header, cursive title,
// spacious key fields, and bottom geometric border notch
// ============================================================================
export function TCTemplate2(props: TCCustomProps) {
  const primary = props.themeColor || '#005D5B'
  const schoolName = props.schoolName || 'COSMOPOLITAN INTER COLLEGE'
  const schoolAddress = props.schoolAddress || 'Knowledge Park, Sector 62, New Delhi, India - 110001'

  // Dynamic Sizing Attributes
  const logoSize = Number(props.logoSize) || 60
  const schoolNameFontSize = Number(props.schoolNameFontSize) || 22
  const titleFontSize = Number(props.titleFontSize) || 24
  const subtitleFontSize = Number(props.subtitleFontSize) || 10.5
  const bodyFontSize = Number(props.bodyFontSize) || 11.5

  return (
    <div className="w-[780px] bg-[#F7F4E9]/40 text-slate-900 p-8 flex flex-col font-sans relative shadow-md select-none rounded-sm">
      
      {/* Outer Double Frame (Image 1) */}
      <div 
        className="w-full bg-white p-7 flex flex-col flex-1 relative border-4 shadow-sm"
        style={{ borderColor: primary }}
      >
        {/* Inner Fine Border */}
        <div className="border border-slate-300 flex flex-col flex-1 relative p-6">
          
          {/* Top Curved Wave Header (Image 1) */}
          <div className="relative overflow-hidden -mx-6 -mt-6 mb-6">
            <svg viewBox="0 0 780 140" className="w-full h-32 block" preserveAspectRatio="none">
              {/* Deep Theme Color Arc */}
              <path
                d="M 0,0 L 780,0 L 780,85 Q 390,140 0,85 Z"
                fill={primary}
              />
              {/* Golden Accent Wave Ribbon */}
              <path
                d="M 0,85 Q 390,140 780,85 Q 390,115 0,85 Z"
                fill="#F59E0B"
                opacity="0.95"
              />
            </svg>

            {/* School Header Text overlay inside the wave */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white pb-6 px-4">
              {props.showLogo !== false && props.schoolLogo && (
                <img 
                  src={props.schoolLogo} 
                  alt="Logo" 
                  className="object-contain rounded-full mb-1 bg-white/20 p-0.5" 
                  style={{ width: `${logoSize * 0.65}px`, height: `${logoSize * 0.65}px` }} 
                />
              )}
              <LiveEditableText 
                tag="h1"
                value={schoolName}
                editable={props.editable}
                onSave={(val) => props.onUpdateField?.('schoolName', val)}
                className="font-bold uppercase tracking-wider" 
                style={{ fontSize: `${schoolNameFontSize}px` }}
              />
              <p className="text-white/90 font-medium mt-0.5" style={{ fontSize: `${subtitleFontSize}px` }}>
                <LiveEditableText
                  tag="span"
                  value={schoolAddress}
                  editable={props.editable}
                  onSave={(val) => props.onUpdateField?.('schoolAddress', val)}
                />
              </p>
              <div className="text-amber-300 font-bold mt-0.5" style={{ fontSize: `${Math.max(8.5, subtitleFontSize - 1)}px` }}>
                Affiliation: {props.affiliationBoard || 'CBSE Board'} &bull; School Code: {props.schoolCode || '0012'}
              </div>
            </div>
          </div>

          {/* Cursive / Calligraphy Title (Exact Image 1 - Customizable Font Size) */}
          <div className="text-center my-3">
            <LiveEditableText 
              tag="h2"
              value={props.title || 'School Transfer'}
              editable={props.editable}
              onSave={(val) => props.onUpdateField?.('title', val)}
              className="font-serif italic text-slate-800 font-normal tracking-wide" 
              style={{ color: primary, fontSize: `${titleFontSize * 1.25}px` }}
            />
            <h3 
              className="font-serif italic text-slate-800 font-normal tracking-wide mt-0.5" 
              style={{ fontSize: `${titleFontSize * 1.05}px` }}
            >
              Certificate
            </h3>
          </div>

          {/* Spaced Two-Column Content Layout (Exact Image 1 - Reactive Body Font Size) */}
          <div className="max-w-[580px] mx-auto w-full space-y-3.5 my-4 font-sans" style={{ fontSize: `${bodyFontSize}px` }}>
            <div className="grid grid-cols-2 gap-4 pb-1 border-b border-slate-150">
              <span className="font-bold text-slate-700">Name of Student:</span>
              <span className="font-black text-slate-900">
                <LiveEditableText
                  value={props.studentName || 'Aarav Sharma'}
                  editable={props.editable}
                  onSave={(val) => props.onUpdateField?.('studentName', val)}
                />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-1 border-b border-slate-150">
              <span className="font-bold text-slate-700">Nationality:</span>
              <span className="font-black text-slate-900">
                <LiveEditableText
                  value={props.nationality || 'Indian'}
                  editable={props.editable}
                  onSave={(val) => props.onUpdateField?.('nationality', val)}
                />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-1 border-b border-slate-150">
              <span className="font-bold text-slate-700">Date of Birth:</span>
              <span className="font-black text-slate-900">
                <LiveEditableText
                  value={props.dobFigures || 'August 15, 2012'}
                  editable={props.editable}
                  onSave={(val) => props.onUpdateField?.('dobFigures', val)}
                />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-1 border-b border-slate-150">
              <span className="font-bold text-slate-700">Curriculum Followed:</span>
              <span className="font-black text-slate-900">K to 12 Curriculum &bull; Secondary Education</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-1 border-b border-slate-150">
              <div>
                <span className="font-bold text-slate-700 block">10 or 12 year school system:</span>
                <span className="text-[10px] text-slate-400">(generally the final year of high school)</span>
              </div>
              <span className="font-black text-slate-900 self-center">12 Year System (CBSE / 10+2)</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-1 border-b border-slate-150">
              <span className="font-bold text-slate-700">Last day school was attended in:</span>
              <span className="font-black text-slate-900">
                <LiveEditableText
                  value={props.dateOfIssue || 'March 31, 2026'}
                  editable={props.editable}
                  onSave={(val) => props.onUpdateField?.('dateOfIssue', val)}
                /> the academic year
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-1 border-b border-slate-150">
              <div>
                <span className="font-bold text-slate-700 block">Current Grade:</span>
                <span className="text-[10px] text-slate-400">OR Currently in Year 2026</span>
              </div>
              <span className="font-black text-slate-900 self-center">
                <LiveEditableText
                  value={props.lastClassStudied || 'Class VII (Seventh)'}
                  editable={props.editable}
                  onSave={(val) => props.onUpdateField?.('lastClassStudied', val)}
                />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-1 border-b border-slate-150">
              <span className="font-bold text-slate-700">Passed and Promoted to:</span>
              <span className="font-black text-emerald-700">
                <LiveEditableText
                  value={props.promotionQualified || 'Class VIII (Eighth Grade)'}
                  editable={props.editable}
                  onSave={(val) => props.onUpdateField?.('promotionQualified', val)}
                />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-1 border-b border-slate-150">
              <span className="font-bold text-slate-700">Admission No. & TC No.:</span>
              <span className="font-black text-slate-900">{props.admissionNo || 'ADM/2018/092'} &bull; {props.tcNo || 'TC/2026/1042'}</span>
            </div>
          </div>

          {/* Principal Signature Block (Image 1) */}
          <div className="max-w-[580px] mx-auto w-full mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-800 block" style={{ fontSize: `${bodyFontSize}px` }}>
                  Signature of Principal / Head Teacher / School Director:
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  (Dependent on whether the student is leaving at the end of an academic year or during the academic year)
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-36 h-0.5 border-t-2 mb-1" style={{ borderColor: primary }}></div>
                <span className="font-black" style={{ color: primary, fontSize: `${bodyFontSize}px` }}>
                  <LiveEditableText
                    value={props.principalSignLabel || 'Head of School'}
                    editable={props.editable}
                    onSave={(val) => props.onUpdateLabel?.('principalSign', val)}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Centered Geometric Notch Accent (Image 1) */}
          <div className="mt-auto flex justify-center -mb-6">
            <div 
              className="w-16 h-4 border-t-4 border-l-4 border-r-4"
              style={{ borderColor: primary, background: '#F59E0B' }}
            />
          </div>

        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TEMPLATE 3: STATE BOARD / TRADITIONAL SCHOOL LEAVING CERTIFICATE (सनद / दाखिला खारिज पंजिका)
// Traditional Indian State Board Format (UP Board, Bihar, Rajasthan, MP, Maharashtra)
// Ledger Register Table, Sanskrit Invocation, S.R. Page, PEN, APAAR & DIOS Seal
// ============================================================================
export function TCTemplate3(props: TCCustomProps) {
  const primary = props.themeColor || '#660033'
  const schoolName = props.schoolName || 'COSMOPOLITAN INTER COLLEGE'
  const schoolAddress = props.schoolAddress || 'Knowledge Park, Sector 62, New Delhi, India - 110001'

  // Dynamic Sizing Attributes
  const logoSize = Number(props.logoSize) || 60
  const schoolNameFontSize = Number(props.schoolNameFontSize) || 24
  const titleFontSize = Number(props.titleFontSize) || 18
  const subtitleFontSize = Number(props.subtitleFontSize) || 10
  const bodyFontSize = Number(props.bodyFontSize) || 10
  const stampSize = Number(props.stampSize) || 72

  const stateBoardLedger = [
    { s: '01', key: 'छात्र पंजिका पृष्ठ संख्या / S.R. Volume & Page No.', val: 'खंड IV / पृष्ठ 112 (Vol IV, Page 112)' },
    { s: '02', key: 'स्थायी शिक्षा संख्या (PEN) / Permanent Education Number', val: '202611094821' },
    { s: '03', key: 'अपार पहचान संख्या / APAAR (EduLocker) ID', val: '9920-4412-8801' },
    { s: '04', key: 'विद्यार्थी का पूरा नाम / Full Name of Pupil', val: props.studentName || 'Aarav Sharma' },
    { s: '05', key: 'माता का नाम / Mother\'s Full Name', val: props.motherName || 'Mrs. Sunita Sharma' },
    { s: '06', key: 'पिता / संरक्षक का नाम / Father\'s Full Name', val: props.fatherName || 'Mr. Rajesh Sharma' },
    { s: '07', key: 'अधिवास / स्थायी निवास स्थान (Permanent Residence)', val: 'Lucknow, Uttar Pradesh, India - 226022' },
    { s: '08', key: 'धर्म एवं जाति वर्ग / Religion & Caste Category', val: `Hindu / ${props.casteCategory || 'General'}` },
    { s: '09', key: 'मातृभाषा / Mother Tongue', val: 'Hindi / हिन्दी' },
    { s: '10', key: 'शारीरिक पहचान का विशेष चिन्ह / Mark of Identification', val: 'A distinct mole on right forehead / दाहिने माथे पर तिल' },
    { s: '11', key: 'जन्म तिथि (अंकों में) / Date of Birth in Figures', val: props.dobFigures || '15/08/2012' },
    { s: '12', key: 'जन्म तिथि (शब्दों में) / Date of Birth in Words', val: props.dobWords || 'Fifteenth August Two Thousand Twelve' },
    { s: '13', key: 'पूर्व विद्यालय का नाम / Previous School Attended', val: 'St. Mary Senior Secondary School, Lucknow' },
    { s: '14', key: 'इस विद्यालय में प्रवेश की तिथि व कक्षा / Admission Date & Class', val: props.admissionDateClass || '04-04-2018 in Class I' },
    { s: '15', key: 'विद्यालय छोड़ने की तिथि एवं अंतिम कक्षा / Leaving Date & Class', val: `31-03-2026 in ${props.lastClassStudied || 'Class VII (Seventh)'}` },
    { s: '16', key: 'अंतिम परीक्षा परिणाम / Result of Last Examination', val: props.schoolBoardExamResult || 'Passed Class VII Annual Examination' },
    { s: '17', key: 'उच्च कक्षा में प्रोन्नति / Qualified for Promotion', val: props.promotionQualified || 'Yes, Promoted to Class VIII (Eighth)' },
    { s: '18', key: 'शुल्क मुक्ति अथवा अवशेष / Fee Clearance & Dues Status', val: 'All school dues paid up to 31st March 2026' },
    { s: '19', key: 'चरित्र एवं नैतिक आचरण / Moral Character & Discipline', val: 'Exemplary / उत्तम एवं शिष्ट' },
    { s: '20', key: 'विद्यालय छोड़ने का ठोस कारण / Reason for Leaving', val: props.reasonForLeaving || "Parents' Relocation / Family Transfer" }
  ]

  return (
    <div 
      className="w-[780px] bg-[#FFFDF6] text-slate-900 p-7 flex flex-col font-serif relative shadow-md select-none rounded-lg border-8"
      style={{ borderColor: primary }}
    >
      {/* Traditional Indian Corner Flourishes */}
      <div className="absolute top-2 left-2 text-sm font-black" style={{ color: primary }}>❖</div>
      <div className="absolute top-2 right-2 text-sm font-black" style={{ color: primary }}>❖</div>
      <div className="absolute bottom-2 left-2 text-sm font-black" style={{ color: primary }}>❖</div>
      <div className="absolute bottom-2 right-2 text-sm font-black" style={{ color: primary }}>❖</div>

      <div className="border-2 p-5 flex flex-col flex-1 relative bg-white/70" style={{ borderColor: primary }}>
        {/* Sanskrit Invocations */}
        <div className="flex justify-between items-center font-black pb-1 mb-2 border-b" style={{ borderColor: hexToRgba(primary, 0.4), color: primary, fontSize: `${subtitleFontSize}px` }}>
          <span>॥ श्री गणेशाय नमः ॥</span>
          <span className="uppercase tracking-widest font-extrabold">॥ विद्या ददाति विनयम ॥</span>
          <span>॥ सा विद्या या विमुक्तये ॥</span>
        </div>

        {/* State Board Accreditation Banner */}
        <div className="text-center mb-2">
          {props.showLogo !== false && props.schoolLogo && (
            <img 
              src={props.schoolLogo} 
              alt="Logo" 
              className="mx-auto object-contain rounded-full mb-1" 
              style={{ width: `${logoSize}px`, height: `${logoSize}px` }} 
            />
          )}
          <p className="font-sans font-bold text-slate-600 uppercase tracking-wider" style={{ fontSize: `${subtitleFontSize}px` }}>
            {props.affiliationBoard || 'माध्यमिक शिक्षा परिषद / राज्य विद्यालयी शिक्षा विभाग द्वारा मान्यता प्राप्त'}
          </p>
          <LiveEditableText 
            tag="h1"
            value={schoolName}
            editable={props.editable}
            onSave={(val) => props.onUpdateField?.('schoolName', val)}
            className="font-black uppercase tracking-wider mt-0.5" 
            style={{ color: primary, fontSize: `${schoolNameFontSize}px` }}
          />
          <p className="font-sans font-medium text-slate-600 mt-0.5" style={{ fontSize: `${subtitleFontSize}px` }}>
            <LiveEditableText
              tag="span"
              value={schoolAddress}
              editable={props.editable}
              onSave={(val) => props.onUpdateField?.('schoolAddress', val)}
            />
          </p>
          <div className="flex justify-center gap-6 font-sans font-bold text-slate-700 mt-1" style={{ fontSize: `${Math.max(8.5, subtitleFontSize - 0.5)}px` }}>
            <span>विद्यालय कोड: <b>{props.schoolCode || '0012'}</b></span>
            <span>सम्बद्धता सं.: <b>{props.affiliationNo || '2130048'}</b></span>
            <span>यू-डायस कोड: <b>{props.udiseCode || '09123456789'}</b></span>
          </div>
        </div>

        {/* Certificate Title Banner */}
        <div className="text-center my-2 pb-2 border-b-2" style={{ borderColor: primary }}>
          <h2 className="font-black uppercase tracking-wider text-slate-900" style={{ fontSize: `${titleFontSize}px` }}>
            स्थानांतरण प्रमाण पत्र (दाखिला-खारिज पंजिका प्रमाण)
          </h2>
          <LiveEditableText 
            tag="p"
            value={props.title || 'SCHOOL LEAVING / TRANSFER CERTIFICATE (S.L.C.)'}
            editable={props.editable}
            onSave={(val) => props.onUpdateField?.('title', val)}
            className="font-sans font-black uppercase tracking-widest" 
            style={{ color: primary, fontSize: `${Math.max(9, titleFontSize * 0.6)}px` }}
          />
        </div>

        {/* Top Ledger Strip */}
        <div className="grid grid-cols-4 gap-2 font-sans font-bold p-1.5 bg-amber-50/70 border border-amber-200/90 rounded mb-2.5 text-slate-900" style={{ fontSize: `${bodyFontSize}px` }}>
          <div>दाखिला सं. / Adm: <b style={{ color: primary }}>{props.admissionNo || 'ADM/2018/092'}</b></div>
          <div>प्रमाण पत्र सं. / TC: <b style={{ color: primary }}>{props.tcNo || 'TC/2026/1042'}</b></div>
          <div>सत्र / Session: <b>2025-26</b></div>
          <div>जारी तिथि: <b>
            <LiveEditableText
              value={props.dateOfIssue || '31-03-2026'}
              editable={props.editable}
              onSave={(val) => props.onUpdateField?.('dateOfIssue', val)}
            />
          </b></div>
        </div>

        {/* Official State Board Tabular Ledger Register (Reactive Font Size) */}
        <div className="border border-slate-350 rounded overflow-hidden flex-1 my-1">
          <table className="w-full border-collapse font-sans" style={{ fontSize: `${bodyFontSize}px` }}>
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                <th className="w-9 py-1 px-1.5 text-center border-r border-slate-300">क्र.सं.</th>
                <th className="w-72 py-1 px-2 text-left border-r border-slate-300">पंजिका विवरण (Register Particulars)</th>
                <th className="py-1 px-2 text-left">छात्र / छात्रा का प्रामाणिक विवरण (Official Record)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stateBoardLedger.map((row) => (
                <tr key={row.s} className="hover:bg-amber-50/30">
                  <td className="py-0.5 px-1.5 text-center font-bold text-slate-500 border-r border-slate-200">{row.s}</td>
                  <td className="py-0.5 px-2 font-bold text-slate-700 border-r border-slate-200">{row.key}</td>
                  <td className="py-0.5 px-2 font-black text-slate-950">{row.val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* State Board Signatures with Circular Seal & DIOS */}
        <div className="mt-3 pt-3 border-t-2 border-slate-300 grid grid-cols-4 gap-3 items-end font-sans font-black uppercase text-slate-700 text-center" style={{ fontSize: `${Math.max(8, bodyFontSize - 1)}px` }}>
          <div className="flex flex-col items-center">
            <div className="w-24 h-0.5 border-t border-dashed border-slate-400 mb-1.5"></div>
            <span>लिपिक / Clerk</span>
          </div>

          {/* Official Round Seal Stamp Box (Customizable Size) */}
          {props.showStamp !== false && (
            <div className="flex flex-col items-center">
              <div 
                className="rounded-full border-2 border-dashed flex flex-col items-center justify-center font-sans uppercase font-black text-slate-400 shadow-2xs"
                style={{ borderColor: primary, width: `${stampSize}px`, height: `${stampSize}px` }}
              >
                <span style={{ fontSize: `${Math.max(5, stampSize * 0.09)}px` }}>विद्यालय की</span>
                <span className="font-extrabold" style={{ color: primary, fontSize: `${Math.max(6, stampSize * 0.11)}px` }}>गोल मुहर</span>
                <span style={{ fontSize: `${Math.max(4.5, stampSize * 0.08)}px` }}>SEAL</span>
              </div>
              <span className="mt-1">संस्था की मुहर</span>
            </div>
          )}

          <div className="flex flex-col items-center">
            <div className="w-24 h-0.5 border-t-2 mb-1.5" style={{ borderColor: primary }}></div>
            <span style={{ color: primary }}>
              प्रधानाचार्य / <LiveEditableText
                value={props.principalSignLabel || 'Principal'}
                editable={props.editable}
                onSave={(val) => props.onUpdateLabel?.('principalSign', val)}
              />
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-28 h-0.5 border-t border-dashed border-slate-400 mb-1.5"></div>
            <span>प्रतिहस्ताक्षरित (DIOS) / Counter-Signed</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TEMPLATE 4: MODERN DIGITAL SMART TC (NEP 2020 / UDISE+ Standard)
// Attested Student Photograph Frame, Dynamic Security QR Code, 1D Barcode,
// Split 2-Column Demographic & Academic Cards, and Cryptographic Digital Seal
// ============================================================================
export function TCTemplate4(props: TCCustomProps) {
  const primary = props.themeColor || '#0F766E'
  const schoolName = props.schoolName || 'COSMOPOLITAN INTER COLLEGE'
  const schoolAddress = props.schoolAddress || 'Knowledge Park, Sector 62, New Delhi, India - 110001'

  // Dynamic Sizing Attributes
  const logoSize = Number(props.logoSize) || 54
  const photoSize = Number(props.photoSize) || 80
  const schoolNameFontSize = Number(props.schoolNameFontSize) || 21
  const titleFontSize = Number(props.titleFontSize) || 18
  const subtitleFontSize = Number(props.subtitleFontSize) || 10.5
  const bodyFontSize = Number(props.bodyFontSize) || 11.5
  const qrSize = Number(props.qrSize) || 44

  return (
    <div 
      className="w-[780px] bg-white text-slate-900 p-6 flex flex-col font-sans relative shadow-md select-none rounded-2xl border-2 overflow-hidden"
      style={{ borderColor: primary }}
    >
      {/* Top Gradient Ribbon Header */}
      <div 
        className="rounded-xl p-4 text-white mb-3 shadow-xs relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primary}, ${adjustHex(primary, -30)})` }}
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {props.showLogo !== false && (
              <div 
                className="rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0 overflow-hidden"
                style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
              >
                {props.schoolLogo ? (
                  <img src={props.schoolLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Award className="text-white" style={{ width: `${logoSize * 0.55}px`, height: `${logoSize * 0.55}px` }} />
                )}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black uppercase tracking-widest bg-emerald-500/90 text-white px-2 py-0.5 rounded-full flex items-center gap-1" style={{ fontSize: `${Math.max(8, subtitleFontSize - 1)}px` }}>
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  VERIFIED DIGITAL TC (NEP 2020)
                </span>
                <span className="font-bold text-white/80" style={{ fontSize: `${Math.max(8.5, subtitleFontSize - 1)}px` }}>UDISE+: {props.udiseCode || '09123456789'}</span>
              </div>
              <LiveEditableText 
                tag="h1"
                value={schoolName}
                editable={props.editable}
                onSave={(val) => props.onUpdateField?.('schoolName', val)}
                className="font-black uppercase tracking-tight mt-1" 
                style={{ fontSize: `${schoolNameFontSize}px` }}
              />
              <p className="opacity-90 font-medium" style={{ fontSize: `${subtitleFontSize}px` }}>
                <LiveEditableText
                  tag="span"
                  value={schoolAddress}
                  editable={props.editable}
                  onSave={(val) => props.onUpdateField?.('schoolAddress', val)}
                />
              </p>
            </div>
          </div>

          <div className="text-right font-bold bg-white/10 backdrop-blur-xs p-2 rounded-xl border border-white/20" style={{ fontSize: `${subtitleFontSize}px` }}>
            <div>Affiliation: {props.affiliationBoard || 'CBSE Affiliated'}</div>
            <div>School Code: <b>{props.schoolCode || '0012'}</b></div>
            <div>Affiliation No: <b>{props.affiliationNo || '2130048'}</b></div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Student Attested Photo Card + 2 Columns */}
      <div className="flex gap-4 mb-3">
        {/* Left: Attested Student Photo Card & Barcode (Customizable Photo Size) */}
        {props.showPhoto !== false && (
          <div className="shrink-0 flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-200" style={{ width: `${Math.max(120, photoSize + 40)}px` }}>
            {/* Photo Frame */}
            <div 
              className="rounded-xl border-2 border-dashed border-slate-300 relative overflow-hidden bg-slate-100 flex flex-col items-center justify-center shadow-inner"
              style={{ width: `${photoSize}px`, height: `${Math.round(photoSize * 1.25)}px` }}
            >
              {props.studentAvatar ? (
                <img src={props.studentAvatar} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <User style={{ width: `${photoSize * 0.45}px`, height: `${photoSize * 0.45}px` }} />
                  <span className="font-bold uppercase mt-1" style={{ fontSize: `${Math.max(7, photoSize * 0.1)}px` }}>Attested Photo</span>
                </div>
              )}
              
              {/* Government Attestation Stamp Overlay */}
              <div className="absolute bottom-1 bg-emerald-600/90 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider" style={{ fontSize: `${Math.max(6.5, photoSize * 0.09)}px` }}>
                OFFICIALLY ATTESTED
              </div>
            </div>

            {/* Student Tag */}
            <div className="text-center mt-2 w-full">
              <span className="font-black text-slate-900 block truncate" style={{ fontSize: `${bodyFontSize}px` }}>
                <LiveEditableText
                  value={props.studentName || 'Aarav Sharma'}
                  editable={props.editable}
                  onSave={(val) => props.onUpdateField?.('studentName', val)}
                />
              </span>
              <span className="font-bold text-slate-500 block" style={{ fontSize: `${Math.max(8.5, bodyFontSize - 1)}px` }}>Class: {props.lastClassStudied || 'Class VII'}</span>
              <span className="font-bold text-teal-700 block" style={{ fontSize: `${Math.max(8.5, bodyFontSize - 1)}px` }}>Adm No: {props.admissionNo || 'ADM/2018/092'}</span>
            </div>

            {/* 1D Barcode Simulation */}
            <div className="mt-3 pt-2 border-t border-slate-200 w-full text-center">
              <div className="h-6 flex items-center justify-center gap-0.5 px-2">
                {[4, 2, 6, 1, 3, 5, 2, 6, 3, 1, 4, 2, 5, 3, 2, 6, 1, 4].map((h, i) => (
                  <div key={i} className="bg-slate-800 w-1" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <span className="text-[8px] font-mono font-bold text-slate-500 mt-0.5 block tracking-widest">
                PEN: 2026-1109-4821
              </span>
            </div>
          </div>
        )}

        {/* Right: 2-Column Dashboard Cards (Reactive Body Font Size) */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {/* Card A: Identity & Demographics */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 pb-1 border-b border-slate-200">
                Demographic Profile
              </span>
              <div className="space-y-1.5" style={{ fontSize: `${bodyFontSize}px` }}>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Father&apos;s Name</span>
                  <span className="font-bold text-slate-900">{props.fatherName || 'Mr. Rajesh Sharma'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Mother&apos;s Name</span>
                  <span className="font-bold text-slate-900">{props.motherName || 'Mrs. Sunita Sharma'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Date of Birth</span>
                  <span className="font-bold text-slate-900">{props.dobFigures || '15/08/2012'} ({props.dobWords || 'Fifteenth August 2012'})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Category</span>
                    <span className="font-bold text-slate-900">{props.casteCategory || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Nationality</span>
                    <span className="font-bold text-slate-900">{props.nationality || 'Indian'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Academic Status & Clearances */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 pb-1 border-b border-slate-200">
                Academic Standing
              </span>
              <div className="space-y-1.5" style={{ fontSize: `${bodyFontSize}px` }}>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Class Last Studied</span>
                  <span className="font-black text-slate-900">{props.lastClassStudied || 'Class VII (Seventh)'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Promotion Status</span>
                  <span className="font-black text-emerald-700">{props.promotionQualified || 'Qualified & Promoted to Class VIII'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Attendance Rate</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '93.5%' }}></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-800">93.5%</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">School Dues Clearance</span>
                  <span className="font-black text-emerald-700">Cleared Full up to {props.duesPaidMonth || 'March 2026'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clearance & Transfer Note Box */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs mb-3">
        <div>
          <span className="font-bold text-slate-500">Reason for Leaving: </span>
          <span className="font-black text-slate-900">{props.reasonForLeaving || "Parents' Relocation / Family Transfer"}</span>
          <span className="text-slate-400 ml-3 font-semibold">Conduct: <b className="text-emerald-700">{props.generalConduct || 'Exemplary'}</b></span>
        </div>
        <div className="text-[10.5px] font-bold text-slate-600">
          TC No: <b style={{ color: primary }}>{props.tcNo || 'TC/2026/1042'}</b>
        </div>
      </div>

      {/* Footer Security Strip & Principal Digital Signature */}
      <div className="mt-auto pt-3 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {props.showQrCode !== false && (
            <div className="p-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <QrCode style={{ color: primary, width: `${qrSize}px`, height: `${qrSize}px` }} />
            </div>
          )}
          <div className="text-[9.5px] text-slate-500 font-semibold leading-tight">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Cryptographically Verified Record
            </div>
            <div className="text-[8.5px] font-mono text-slate-400 mt-0.5">HASH: 7a8f90b2c45e6d11</div>
            <div className="text-slate-400">Date Issued: {props.dateOfIssue || '31-03-2026'}</div>
          </div>
        </div>

        {/* Digital Signature Pill */}
        <div className="flex items-center gap-6 text-[10px] font-black uppercase text-slate-700">
          <div className="flex flex-col items-center">
            <div className="w-20 h-0.5 bg-slate-300 mb-1"></div>
            <span>
              <LiveEditableText
                value={props.teacherSignLabel || 'Class Teacher'}
                editable={props.editable}
                onSave={(val) => props.onUpdateLabel?.('teacherSign', val)}
              />
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-0.5 bg-slate-300 mb-1"></div>
            <span>
              <LiveEditableText
                value={props.checkedBySignLabel || 'Checked By'}
                editable={props.editable}
                onSave={(val) => props.onUpdateLabel?.('checkedBySign', val)}
              />
            </span>
          </div>
          <div className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-left">
              <span className="text-[8.5px] font-bold text-emerald-800 block">Digitally Certified</span>
              <span className="text-[10px] font-black text-slate-900 block" style={{ color: primary }}>
                <LiveEditableText
                  value={props.principalSignLabel || 'Principal'}
                  editable={props.editable}
                  onSave={(val) => props.onUpdateLabel?.('principalSign', val)}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MINI PREVIEWS FOR STEP 4 TEMPLATE SELECTION (Matching the 4 Archetypes)
// ============================================================================
export function TCMiniPreview({ designId, themeColor }: { designId: number; themeColor?: string }) {
  const primary = themeColor || '#1E3A8A'

  switch (designId) {
    case 1:
      // Template 1: Authentic Indian CBSE Standard (Exact Image 2)
      return (
        <div className="w-full h-full bg-white rounded-lg p-2 flex flex-col justify-between border border-slate-300 relative overflow-hidden text-[7px]">
          {/* Header */}
          <div className="flex items-center gap-1 pb-1 border-b border-slate-300">
            <div className="w-4 h-4 rounded border flex items-center justify-center font-bold" style={{ borderColor: primary, color: primary }}>
              <Award className="w-2.5 h-2.5" />
            </div>
            <div className="truncate flex-1 text-center">
              <div className="font-black text-[6.5px] uppercase truncate" style={{ color: primary }}>COSMOPOLITAN INTER COLLEGE</div>
              <div className="text-[4.5px] text-slate-500">Affiliated to CBSE New Delhi &bull; Code: 0012</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-0.5">
            <span className="text-[6.5px] font-black uppercase text-slate-900 underline" style={{ textDecorationColor: primary }}>
              TRANSFER CERTIFICATE
            </span>
          </div>

          {/* 3 Reference Boxes */}
          <div className="grid grid-cols-3 gap-0.5 text-[4.5px] font-bold text-slate-600 mb-0.5">
            <div>Aff: 6130011</div>
            <div className="text-center text-teal-800">TC: 1042</div>
            <div className="text-right">Adm: 092</div>
          </div>

          {/* 25 lines simulation */}
          <div className="space-y-0.5 flex-1">
            {[
              { num: '1', l: 'Name of the Student', v: 'Aarav Sharma' },
              { num: '2', l: "Mother's Name", v: 'Sunita Sharma' },
              { num: '3', l: "Father's Name", v: 'Rajesh Sharma' },
              { num: '5', l: 'Date of Birth (Words & Fig)', v: '15/08/2012' },
              { num: '10', l: 'Class Last Studied', v: 'Class VII' },
            ].map((r) => (
              <div key={r.num} className="flex items-center text-[4.5px] border-b border-dotted border-slate-300 py-0.5">
                <span className="w-2.5 font-bold text-slate-500">{r.num}.</span>
                <span className="w-20 text-slate-700 truncate">{r.l}</span>
                <span className="text-slate-400 px-0.5">:</span>
                <span className="flex-1 text-slate-900 font-bold truncate">{r.v}</span>
              </div>
            ))}
          </div>

          {/* Blue Stamp & Signatures */}
          <div className="flex justify-between items-center text-[5px] font-bold text-slate-600 pt-0.5 border-t">
            <span>Date: 31/03</span>
            <div className="w-4 h-4 rounded-full border border-blue-600 border-double flex items-center justify-center text-[3.5px] text-blue-700 font-bold">
              SEAL
            </div>
            <span>Checked</span>
            <span style={{ color: primary }}>Principal</span>
          </div>
        </div>
      )

    case 2:
      // Template 2: Modern Wave / Curved Ribbon Certificate (Exact Image 1)
      return (
        <div className="w-full h-full bg-[#F7F4E9]/50 rounded-lg p-1.5 flex flex-col justify-between border-2 relative overflow-hidden text-[7px]" style={{ borderColor: primary }}>
          <div className="w-full h-full bg-white border border-slate-200 p-1 rounded flex flex-col justify-between overflow-hidden">
            {/* Top Wave Simulation */}
            <div className="relative -mx-1 -mt-1 p-1 text-white text-center rounded-b-xl" style={{ background: primary }}>
              <div className="text-[6px] font-bold uppercase truncate">COSMOPOLITAN INTER COLLEGE</div>
              <div className="text-[4px] text-amber-300">नई दिल्ली • New Delhi, India</div>
            </div>

            {/* Cursive Title */}
            <div className="text-center my-0.5">
              <span className="text-[7.5px] font-serif italic font-bold" style={{ color: primary }}>
                School Transfer Certificate
              </span>
            </div>

            {/* Spaced fields */}
            <div className="space-y-0.5 text-[5px] flex-1 px-1">
              <div className="flex justify-between border-b pb-0.5">
                <span className="text-slate-500">Name of Student:</span>
                <span className="font-bold">Aarav Sharma</span>
              </div>
              <div className="flex justify-between border-b pb-0.5">
                <span className="text-slate-500">Curriculum:</span>
                <span className="font-bold">K to 12 System</span>
              </div>
              <div className="flex justify-between border-b pb-0.5">
                <span className="text-slate-500">Current Grade:</span>
                <span className="font-bold">Class VII</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Passed & Promoted:</span>
                <span className="font-bold text-emerald-700">Class VIII</span>
              </div>
            </div>

            {/* Bottom Signature & Notch */}
            <div className="pt-0.5 border-t flex flex-col items-center">
              <span className="text-[4.5px] text-slate-500">Signature of Principal / Head Teacher</span>
              <div className="w-6 h-1 border-t-2 mt-0.5" style={{ borderColor: primary, background: '#F59E0B' }} />
            </div>
          </div>
        </div>
      )

    case 3:
      // Template 3: State Board / Traditional SLC (Ledger Register Format)
      return (
        <div 
          className="w-full h-full bg-[#FFFDF6] rounded-lg p-1.5 flex flex-col justify-between border-3 relative overflow-hidden text-[7px]"
          style={{ borderColor: primary }}
        >
          <div className="border border-amber-300 p-1 rounded flex flex-col h-full justify-between bg-white/70">
            {/* Sanskrit Invocations */}
            <div className="text-[4.5px] text-center font-bold pb-0.5 border-b truncate" style={{ color: primary }}>
              ॥ विद्या ददाति विनयम ॥ &bull; राज्य बोर्ड दाखिला-खारिज
            </div>

            <div className="text-center my-0.5">
              <div className="font-black text-[6.5px] uppercase truncate" style={{ color: primary }}>COSMOPOLITAN INTER</div>
              <div className="text-[5px] font-black uppercase text-slate-800">
                स्थानांतरण प्रमाण पत्र (दाखिला खारिज)
              </div>
            </div>

            {/* Mini Table Simulation */}
            <div className="border border-slate-300 rounded overflow-hidden flex-1 my-0.5 text-[4.5px]">
              <div className="bg-slate-100 font-bold p-0.5 border-b flex justify-between">
                <span>पंजिका विवरण</span>
                <span>प्रविष्टि</span>
              </div>
              <div className="space-y-0.5 p-0.5">
                <div className="flex justify-between border-b pb-0.5">
                  <span className="text-slate-500">छात्र नाम / PEN</span>
                  <span className="font-bold">Aarav Sharma</span>
                </div>
                <div className="flex justify-between border-b pb-0.5">
                  <span className="text-slate-500">पहचान चिन्ह</span>
                  <span className="font-bold">माथे पर तिल</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">अंतिम कक्षा</span>
                  <span className="font-bold text-emerald-800">Class VII Passed</span>
                </div>
              </div>
            </div>

            {/* Seal & DIOS */}
            <div className="flex justify-between items-center text-[4.5px] font-bold pt-0.5 border-t">
              <span>लिपिक</span>
              <span className="border border-dashed px-1 rounded text-[4px] text-slate-400">गोल मुहर</span>
              <span style={{ color: primary }}>प्रधानाचार्य</span>
              <span>DIOS</span>
            </div>
          </div>
        </div>
      )

    case 4:
      // Template 4: Modern Digital Smart TC (Photo + QR + Barcode)
      return (
        <div 
          className="w-full h-full bg-white rounded-lg p-1.5 flex flex-col justify-between border-2 relative overflow-hidden text-[7px]"
          style={{ borderColor: primary }}
        >
          {/* Modern Top Gradient Bar */}
          <div className="p-1 rounded text-white flex justify-between items-center mb-0.5" style={{ background: primary }}>
            <span className="font-black text-[6px]">COSMOPOLITAN INTER</span>
            <span className="text-[4.5px] font-bold bg-white/20 px-1 rounded">NEP 2020 SMART TC</span>
          </div>

          {/* Photo + 2 Cards layout simulation */}
          <div className="flex gap-1 flex-1 my-0.5">
            {/* Student Photo */}
            <div className="w-9 bg-slate-50 border rounded p-0.5 flex flex-col items-center justify-between text-center">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-[3.5px] font-bold bg-emerald-600 text-white rounded px-0.5">ATTESTED</span>
              <span className="text-[4px] font-bold truncate w-full">Aarav S.</span>
            </div>

            {/* Right Mini Cards */}
            <div className="flex-1 space-y-0.5 text-[4.5px]">
              <div className="bg-slate-50 p-0.5 rounded border">
                <span className="text-slate-400 block text-[4px]">PEN / APAAR</span>
                <span className="font-bold text-slate-800">2026-1109-4821</span>
              </div>
              <div className="bg-slate-50 p-0.5 rounded border">
                <span className="text-slate-400 block text-[4px]">ACADEMIC RESULT</span>
                <span className="font-bold text-emerald-700">Passed & Promoted</span>
              </div>
            </div>
          </div>

          {/* Barcode & Digital Sign Footer */}
          <div className="flex justify-between items-center text-[4.5px] font-bold pt-0.5 border-t mt-0.5">
            <QrCode className="w-2.5 h-2.5 text-slate-700" />
            <span className="text-[4.5px] font-mono text-slate-400">|||||||||||||||</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-200">
              ✔ Digitally Signed
            </span>
          </div>
        </div>
      )

    default:
      return null
  }
}

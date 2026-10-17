'use client'

import React, { useRef } from 'react'
import {
  X,
  Printer,
  Sparkles,
  QrCode,
  School,
  Award,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Scissors,
  AlertCircle,
  FileText,
  MapPin,
  Check
} from 'lucide-react'
import { AdmitCardConfig, getStoredTimetables } from '@/lib/admit-card-sync'

interface AdmitCardModalPreviewProps {
  card: AdmitCardConfig | null
  customSubjects?: { subjectName: string; date: string; fromTime: string; toTime: string }[]
  onClose: () => void
}

export interface AdmitCardPaperProps {
  card: AdmitCardConfig | null
  customSubjects?: { subjectName: string; date: string; fromTime: string; toTime: string }[]
  className?: string
}

// Convert any 3 or 6 hex code to rgba string
export function hexToRgba(hex?: string, alpha: number = 1): string {
  if (!hex || typeof hex !== 'string') return `rgba(30, 58, 138, ${alpha})`
  let cleanHex = hex.trim().replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('')
  }
  const num = parseInt(cleanHex, 16)
  if (isNaN(num)) return `rgba(30, 58, 138, ${alpha})`
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const AdmitCardPaper: React.FC<AdmitCardPaperProps> = ({ card, customSubjects, className = '' }) => {
  if (!card) return null

  // Lookup timetable subjects
  const timetables = getStoredTimetables()
  const table = timetables.find(t => t.id === Number(card.timeTableId))
  const subjects = (customSubjects && customSubjects.length > 0)
    ? customSubjects
    : (table && table.subjects && table.subjects.length > 0)
      ? table.subjects
      : [
        { subjectName: 'English Core', date: '2025-03-21', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'Mathematics', date: '2025-03-23', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'General Science', date: '2025-03-25', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'Social Science', date: '2025-03-27', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'Hindi / Regional', date: '2025-03-29', fromTime: '10:00', toTime: '13:00' }
      ]

  const fields = card.displayFields || {}

  // Determine template style type (normalize for backwards compatibility)
  const styleRaw = (card.templateStyle || 'Classic Board').toLowerCase()
  let templateType: 'classic' | 'modern' | 'executive' | 'compact' = 'classic'
  if (styleRaw.includes('modern') || styleRaw.includes('emerald') || styleRaw.includes('split') || styleRaw.includes('dual')) {
    templateType = 'modern'
  } else if (styleRaw.includes('executive') || styleRaw.includes('crimson') || styleRaw.includes('heritage') || styleRaw.includes('crest')) {
    templateType = 'executive'
  } else if (styleRaw.includes('compact') || styleRaw.includes('minimal') || styleRaw.includes('slate') || styleRaw.includes('ticket')) {
    templateType = 'compact'
  }

  // Determine Theme Color (respect explicit themeColor, or fallback to historical default)
  let primaryColor = card.themeColor
  if (!primaryColor) {
    if (styleRaw.includes('emerald')) primaryColor = '#047857'
    else if (styleRaw.includes('crimson')) primaryColor = '#991b1b'
    else if (styleRaw.includes('slate')) primaryColor = '#334155'
    else primaryColor = '#1e3a8a'
  }

  const bgTintLight = hexToRgba(primaryColor, 0.05)
  const bgTintMedium = hexToRgba(primaryColor, 0.1)
  const bgTintSubtle = hexToRgba(primaryColor, 0.03)
  const borderTint = hexToRgba(primaryColor, 0.25)
  const borderTintStrong = hexToRgba(primaryColor, 0.5)

  const schoolName = card.schoolName || 'COSMOPOLITAN INTER COLLEGE'
  const schoolAddress = card.schoolAddress || 'Knowledge Park, Sector 62, New Delhi - 110092'
  const examName = card.examName || 'Final Term Examination'
  const session = card.session || '2025-2026'
  const classNameStr = card.className || 'Class X'
  const admitLabel = card.admitCardLabel || 'ADMIT CARD • HALL TICKET'
  const instructions = card.instructions ||
    '1. Candidates must arrive at the examination center 30 minutes before scheduled time.\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices, smartwatches, and study materials are strictly prohibited in the exam hall.\n4. Maintain discipline and follow invigilator guidelines at all times.'

  return (
    <div
      id="printable-admit-card-container"
      className={`w-full max-w-[800px] bg-white text-slate-900 flex flex-col font-sans shrink-0 relative shadow-2xl rounded-2xl select-none print:shadow-none print:rounded-none overflow-hidden ${className}`}
    >
      {/* ========================================================================= */}
      {/* TEMPLATE 1: CLASSIC BOARD OFFICIAL (CBSE / State Board Official Style)    */}
      {/* ========================================================================= */}
      {templateType === 'classic' && (
        <div
          className="p-6 sm:p-7 flex flex-col relative"
          style={{
            border: `3px double ${primaryColor}`,
            boxShadow: `inset 0 0 0 1px ${borderTint}`
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 pb-3 mb-3" style={{ borderColor: borderTintStrong }}>
            <div className="flex items-center gap-3.5">
              <div
                className="w-16 h-16 rounded-full flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-xs border-2"
                style={{
                  borderColor: primaryColor,
                  backgroundColor: bgTintLight,
                  color: primaryColor
                }}
              >
                <span className="text-[8px] uppercase tracking-tighter">ESTD</span>
                <span className="text-sm font-black">2010</span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide" style={{ color: primaryColor }}>
                  {schoolName}
                </h1>
                <p className="text-[10.5px] font-semibold text-slate-600 leading-tight">
                  {schoolAddress}
                </p>

                <div className="grid grid-cols-2 gap-x-5 gap-y-0.5 text-[9px] font-bold text-slate-700 mt-1.5">
                  <div>Aff. To : Central Board of Secondary Education</div>
                  <div>School Code : 123456</div>
                  <div>Aff. No. : 2130842</div>
                  <div>UDISE Code : 09100201923</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className="px-2 py-0.5 rounded text-[8px] font-black uppercase text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                Board Format
              </span>
              <QrCode className="w-12 h-12 text-slate-800 bg-white p-0.5 border border-slate-200 rounded mt-0.5" />
              <span className="text-[7.5px] text-slate-400 font-bold font-mono">CODE: 123456</span>
            </div>
          </div>

          {/* Sub Header Contact */}
          <div className="flex justify-center gap-6 text-[9.5px] font-bold text-slate-600 border-b pb-1.5 mb-3" style={{ borderColor: borderTint }}>
            <span>Email : contact@cosmopolitan.edu</span>
            <span>•</span>
            <span>Helpline : +91 11 2345 6789 / 9999999999</span>
          </div>

          {/* Title Banner */}
          <div className="text-center my-1.5">
            <div
              className="inline-block px-8 py-1.5 rounded-lg shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <h2 className="text-sm sm:text-base font-black tracking-widest uppercase text-white">
                {admitLabel}
              </h2>
            </div>
          </div>

          {/* Term & Session info bar */}
          <div
            className="flex justify-between items-center text-[11px] font-black uppercase mb-3.5 px-3 py-1.5 rounded-lg border"
            style={{
              backgroundColor: bgTintLight,
              borderColor: borderTint,
              color: primaryColor
            }}
          >
            <span>EXAMINATION : {examName}</span>
            <span>ACADEMIC SESSION : {session}</span>
          </div>

          {/* Student Details & Photo */}
          <div className="flex gap-4 items-start mb-4">
            <div className="flex-1 grid grid-cols-2 gap-x-5 gap-y-2 text-xs text-slate-800">
              {fields.admissionNo !== false && (
                <div className="flex">
                  <span className="font-extrabold whitespace-nowrap">Admission No. :</span>
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-900 px-1">
                    ADM-2025-089
                  </span>
                </div>
              )}

              {fields.rollNo !== false && (
                <div className="flex">
                  <span className="font-extrabold whitespace-nowrap">Roll No. :</span>
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-black text-slate-900 px-1" style={{ color: primaryColor }}>
                    10104
                  </span>
                </div>
              )}

              {fields.name !== false && (
                <div className="flex col-span-2">
                  <span className="font-extrabold whitespace-nowrap">Candidate Name :</span>
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-black text-sm px-1" style={{ color: primaryColor }}>
                    Aarav Sharma
                  </span>
                </div>
              )}

              {fields.fatherName !== false && (
                <div className="flex">
                  <span className="font-extrabold whitespace-nowrap">Father Name :</span>
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-700 px-1">
                    Rajesh Sharma
                  </span>
                </div>
              )}

              {fields.motherName !== false && (
                <div className="flex">
                  <span className="font-extrabold whitespace-nowrap">Mother Name :</span>
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-700 px-1">
                    Sunita Sharma
                  </span>
                </div>
              )}

              {fields.class !== false && (
                <div className="flex">
                  <span className="font-extrabold whitespace-nowrap">Class :</span>
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-black text-slate-900 px-1">
                    {classNameStr}
                  </span>
                </div>
              )}

              {fields.section !== false && (
                <div className="flex">
                  <span className="font-extrabold whitespace-nowrap">Section :</span>
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-black text-slate-900 px-1">
                    Section A
                  </span>
                </div>
              )}

              {fields.dob !== false && (
                <div className="flex">
                  <span className="font-extrabold whitespace-nowrap">Date of Birth :</span>
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-700 px-1">
                    15/08/2010
                  </span>
                </div>
              )}

              {fields.mobileNo !== false && (
                <div className="flex">
                  <span className="font-extrabold whitespace-nowrap">Mobile No. :</span>
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-700 px-1">
                    +91 98765 43210
                  </span>
                </div>
              )}

              {fields.address !== false && (
                <div className="flex col-span-2">
                  <span className="font-extrabold whitespace-nowrap">Address :</span>
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 text-[11px] text-slate-600 px-1">
                    H.No. 45, Green Avenue, Knowledge Park, New Delhi - 110092
                  </span>
                </div>
              )}
            </div>

            {/* Photo Box with Specimen Signature underneath */}
            {fields.photo !== false && (
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className="w-24 h-28 bg-slate-50 border-2 rounded flex flex-col items-center justify-center text-[9px] text-slate-400 font-bold shrink-0 shadow-xs relative overflow-hidden"
                  style={{ borderColor: borderTintStrong }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-slate-300 p-1 text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 mb-1" />
                    <span className="text-[8px] uppercase font-bold text-slate-500">Student Photo</span>
                  </div>
                </div>
                <div
                  className="w-24 py-1 border text-center text-[7.5px] font-black uppercase text-slate-600 rounded bg-slate-50"
                  style={{ borderColor: borderTint }}
                >
                  Specimen Sign
                </div>
              </div>
            )}
          </div>

          {/* Time Table */}
          <div className="space-y-1.5 mt-1">
            <div
              className="text-center font-black text-[11px] tracking-widest uppercase py-1 rounded"
              style={{ backgroundColor: bgTintMedium, color: primaryColor }}
            >
              EXAMINATION DATE SHEET & TIME TABLE
            </div>

            <div className="border rounded-lg overflow-hidden" style={{ borderColor: borderTintStrong }}>
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="font-black text-white text-[11px]" style={{ backgroundColor: primaryColor }}>
                    <th className="py-2 px-2 border-r border-white/20 w-12">S.No.</th>
                    <th className="py-2 px-3 border-r border-white/20 w-28">Exam Date</th>
                    <th className="py-2 px-3 border-r border-white/20 w-32">Time Slot</th>
                    <th className="py-2 px-3 border-r border-white/20 text-left">Subject / Paper</th>
                    <th className="py-2 px-3 w-32">Invigilator Sign</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub: any, sidx: number) => (
                    <tr
                      key={sidx}
                      className="border-b font-semibold text-slate-700"
                      style={{
                        borderColor: borderTint,
                        backgroundColor: sidx % 2 === 0 ? 'transparent' : bgTintSubtle
                      }}
                    >
                      <td className="py-1.5 border-r font-bold" style={{ borderColor: borderTint }}>{sidx + 1}.</td>
                      <td className="py-1.5 border-r font-bold text-slate-900" style={{ borderColor: borderTint }}>{sub.date}</td>
                      <td className="py-1.5 border-r text-slate-600" style={{ borderColor: borderTint }}>{sub.fromTime} - {sub.toTime || '13:00'}</td>
                      <td className="py-1.5 px-3 border-r text-left text-slate-900 font-bold" style={{ borderColor: borderTint }}>{sub.subjectName}</td>
                      <td className="py-1.5"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions */}
          {instructions && (
            <div
              className="mt-3 p-2.5 rounded-lg border text-[9px] text-slate-700 leading-relaxed"
              style={{ backgroundColor: bgTintSubtle, borderColor: borderTint }}
            >
              <span className="font-black uppercase" style={{ color: primaryColor }}>Important Candidate Instructions:</span>
              <p className="mt-0.5 whitespace-pre-line text-slate-600">{instructions}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-4 gap-4 text-center mt-8 pb-1 text-[8.5px] font-black uppercase text-slate-700">
            <div className="flex flex-col items-center">
              <div className="w-[85%] h-0.5 border-t border-dashed border-slate-400 mb-1.5" />
              <span>Candidate Sign</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-[85%] h-0.5 border-t border-dashed border-slate-400 mb-1.5" />
              <span>Parent Sign</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-[85%] h-0.5 border-t border-dashed border-slate-400 mb-1.5" />
              <span>Invigilator Sign</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-[85%] h-0.5 border-t border-dashed border-slate-400 mb-1.5" />
              <span>Principal Sign & Seal</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE 2: MODERN DUAL-COLUMN PASS (Academy Split-Column Format)          */}
      {/* ========================================================================= */}
      {templateType === 'modern' && (
        <div className="flex flex-col sm:flex-row min-h-[580px] border-2" style={{ borderColor: primaryColor }}>
          {/* Left Column Profile Sidebar */}
          <div
            className="w-full sm:w-64 p-5 flex flex-col justify-between border-b sm:border-b-0 sm:border-r"
            style={{
              backgroundColor: bgTintLight,
              borderColor: borderTintStrong
            }}
          >
            <div className="space-y-4">
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  Verified Pass
                </span>
                <span className="text-[9px] font-black text-slate-500 font-mono">#ADM-089</span>
              </div>

              {/* Photo */}
              <div className="flex flex-col items-center">
                <div
                  className="w-28 h-32 rounded-xl border-2 p-1 bg-white shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
                  style={{ borderColor: primaryColor }}
                >
                  <div className="w-full h-full rounded-lg bg-slate-100 flex flex-col items-center justify-center border border-dashed border-slate-300 text-center p-2">
                    <User className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Aarav Sharma</span>
                  </div>
                  <div
                    className="absolute bottom-1.5 right-1.5 px-1 py-0.5 rounded text-[7px] font-black text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ACTIVE
                  </div>
                </div>
              </div>

              {/* Roll No Callout Box */}
              <div
                className="rounded-xl p-3 text-center text-white shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="text-[9px] font-bold uppercase tracking-wider text-white/80">Roll Number</div>
                <div className="text-xl font-black tracking-widest mt-0.5">10104</div>
                <div className="text-[10px] font-bold text-white/90 mt-1 pt-1 border-t border-white/20">
                  {classNameStr} • Sec A
                </div>
              </div>

              {/* QR Code Verification */}
              <div className="bg-white p-2.5 rounded-xl border flex flex-col items-center gap-1.5 shadow-xs" style={{ borderColor: borderTint }}>
                <QrCode className="w-16 h-16 text-slate-800" />
                <span className="text-[7.5px] font-bold text-slate-500 text-center">Scan to Verify Candidate Record</span>
              </div>
            </div>

            {/* Candidate Specimen Signature */}
            <div className="pt-3 border-t mt-4" style={{ borderColor: borderTint }}>
              <div className="h-9 border border-dashed rounded-lg bg-white/70 flex items-center justify-center text-[8px] font-bold text-slate-400" style={{ borderColor: borderTintStrong }}>
                Candidate's Specimen Signature
              </div>
              <div className="text-[7.5px] font-semibold text-slate-500 text-center mt-1">
                Emergency Helpline: +91 11 2345 6789
              </div>
            </div>
          </div>

          {/* Right Column Content */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between bg-white">
            <div>
              {/* Header */}
              <div className="border-b pb-3 mb-3" style={{ borderColor: borderTint }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight" style={{ color: primaryColor }}>
                      {schoolName}
                    </h1>
                    <p className="text-[10px] text-slate-500 font-semibold">{schoolAddress}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase text-white tracking-wider"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {admitLabel}
                    </span>
                    <div className="text-[9px] font-bold text-slate-500 mt-1">Session: {session}</div>
                  </div>
                </div>

                <div
                  className="mt-2.5 px-3 py-1 rounded-md text-[10.5px] font-black uppercase flex items-center justify-between"
                  style={{ backgroundColor: bgTintMedium, color: primaryColor }}
                >
                  <span>EXAM: {examName}</span>
                  <span>CENTER CODE: CC-104</span>
                </div>
              </div>

              {/* Student Details Grid (Pill tiles) */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                  <div className="text-[8.5px] font-bold text-slate-400 uppercase">Student Name</div>
                  <div className="font-black text-slate-900 text-xs" style={{ color: primaryColor }}>Aarav Sharma</div>
                </div>
                <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                  <div className="text-[8.5px] font-bold text-slate-400 uppercase">Admission No.</div>
                  <div className="font-black text-slate-800 text-xs">ADM-2025-089</div>
                </div>
                <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                  <div className="text-[8.5px] font-bold text-slate-400 uppercase">Father's Name</div>
                  <div className="font-bold text-slate-800 text-xs">Rajesh Sharma</div>
                </div>
                <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                  <div className="text-[8.5px] font-bold text-slate-400 uppercase">Mother's Name</div>
                  <div className="font-bold text-slate-800 text-xs">Sunita Sharma</div>
                </div>
                <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                  <div className="text-[8.5px] font-bold text-slate-400 uppercase">Date of Birth</div>
                  <div className="font-bold text-slate-800 text-xs">15/08/2010</div>
                </div>
                <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                  <div className="text-[8.5px] font-bold text-slate-400 uppercase">Registration No.</div>
                  <div className="font-bold text-slate-800 text-xs">REG-2025-9842</div>
                </div>
              </div>

              {/* Datesheet Table */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-800 uppercase">
                  <span>Subject Examination Schedule</span>
                  <span className="text-[8.5px] text-slate-400 font-bold">{subjects.length} Subjects Scheduled</span>
                </div>
                <div className="border rounded-xl overflow-hidden" style={{ borderColor: borderTintStrong }}>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="text-white text-[10px] font-black" style={{ backgroundColor: primaryColor }}>
                        <th className="py-1.5 px-2.5">Date</th>
                        <th className="py-1.5 px-2.5">Time</th>
                        <th className="py-1.5 px-2.5">Subject Paper</th>
                        <th className="py-1.5 px-2.5 text-center">Invigilator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: borderTint }}>
                      {subjects.map((sub: any, sidx: number) => (
                        <tr key={sidx} className="text-[11px] font-semibold text-slate-700">
                          <td className="py-1 px-2.5 font-bold text-slate-900">{sub.date}</td>
                          <td className="py-1 px-2.5 text-slate-600">{sub.fromTime} - {sub.toTime || '13:00'}</td>
                          <td className="py-1 px-2.5 font-bold" style={{ color: primaryColor }}>{sub.subjectName}</td>
                          <td className="py-1 px-2.5 text-center">
                            <span className="inline-block w-14 h-4 border border-dashed rounded bg-slate-50" style={{ borderColor: borderTint }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Signatures & Stamp */}
            <div className="pt-4 border-t mt-4 flex items-end justify-between" style={{ borderColor: borderTint }}>
              <div className="text-[8px] text-slate-500 max-w-[280px]">
                <strong>Note:</strong> Carry original student ID card with this admit card. Gate closes 15 mins prior to examination.
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="w-24 h-0.5 border-t border-dashed border-slate-400 mb-1" />
                  <span className="text-[8px] font-black uppercase text-slate-700">Class Teacher</span>
                </div>
                <div>
                  <div className="w-24 h-0.5 border-t border-dashed border-slate-400 mb-1" />
                  <span className="text-[8px] font-black uppercase text-slate-700">Principal & Stamp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE 3: EXECUTIVE HERITAGE (Crest & Formal Certificate Style)          */}
      {/* ========================================================================= */}
      {templateType === 'executive' && (
        <div
          className="p-7 relative bg-white"
          style={{
            border: `6px double ${primaryColor}`,
            boxShadow: `inset 0 0 0 2px ${borderTint}`
          }}
        >
          {/* Ornate Corner Elements */}
          <div className="absolute top-2 left-2 text-[10px] font-serif font-black" style={{ color: primaryColor }}>◆ ❖ ◆</div>
          <div className="absolute top-2 right-2 text-[10px] font-serif font-black" style={{ color: primaryColor }}>◆ ❖ ◆</div>
          <div className="absolute bottom-2 left-2 text-[10px] font-serif font-black" style={{ color: primaryColor }}>◆ ❖ ◆</div>
          <div className="absolute bottom-2 right-2 text-[10px] font-serif font-black" style={{ color: primaryColor }}>◆ ❖ ◆</div>

          {/* Centered Crest Header */}
          <div className="text-center pb-3 border-b-2" style={{ borderColor: borderTintStrong }}>
            <div className="flex justify-center mb-1">
              <div
                className="w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-xs"
                style={{ borderColor: primaryColor, backgroundColor: bgTintLight, color: primaryColor }}
              >
                <Award className="w-7 h-7" />
              </div>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider font-serif" style={{ color: primaryColor }}>
              {schoolName}
            </h1>
            <p className="text-[10px] font-serif text-slate-600 font-semibold tracking-wide mt-0.5">
              An Autonomous Institution Committed to Academic Excellence
            </p>
            <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
              {schoolAddress} • CBSE Affiliation No. 2130842 • School Code 123456
            </p>

            {/* Official Title Ribbon */}
            <div className="mt-3 flex justify-center">
              <div
                className="px-6 py-1.5 rounded-full border text-white font-serif uppercase tracking-widest text-xs font-black shadow-xs"
                style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
              >
                {admitLabel} • SESSION {session}
              </div>
            </div>
            <div className="text-[11px] font-serif font-black uppercase mt-1.5" style={{ color: primaryColor }}>
              {examName}
            </div>
          </div>

          {/* Candidate Profile Block */}
          <div className="my-4 flex gap-5 items-center bg-slate-50/60 p-3.5 rounded-xl border" style={{ borderColor: borderTint }}>
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex">
                <span className="font-serif font-bold text-slate-600 w-28">Roll Number:</span>
                <span className="font-black text-slate-900" style={{ color: primaryColor }}>10104</span>
              </div>
              <div className="flex">
                <span className="font-serif font-bold text-slate-600 w-28">Admission No.:</span>
                <span className="font-bold text-slate-800">ADM-2025-089</span>
              </div>
              <div className="flex col-span-2">
                <span className="font-serif font-bold text-slate-600 w-28">Candidate Name:</span>
                <span className="font-black text-slate-900 text-sm font-serif" style={{ color: primaryColor }}>Aarav Sharma</span>
              </div>
              <div className="flex">
                <span className="font-serif font-bold text-slate-600 w-28">Class & Section:</span>
                <span className="font-bold text-slate-800">{classNameStr} - Section A</span>
              </div>
              <div className="flex">
                <span className="font-serif font-bold text-slate-600 w-28">Date of Birth:</span>
                <span className="font-bold text-slate-800">15-Aug-2010</span>
              </div>
              <div className="flex">
                <span className="font-serif font-bold text-slate-600 w-28">Father's Name:</span>
                <span className="font-bold text-slate-800">Rajesh Sharma</span>
              </div>
              <div className="flex">
                <span className="font-serif font-bold text-slate-600 w-28">Mother's Name:</span>
                <span className="font-bold text-slate-800">Sunita Sharma</span>
              </div>
            </div>

            {/* Photo & Verified Seal */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                className="w-24 h-28 border-2 rounded-lg bg-white flex flex-col items-center justify-center p-1 shadow-sm"
                style={{ borderColor: primaryColor }}
              >
                <div className="w-full h-full border border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-center p-1">
                  <User className="w-7 h-7 text-slate-400 mb-0.5" />
                  <span className="text-[7.5px] uppercase font-bold text-slate-500 font-serif">Candidate Photo</span>
                </div>
              </div>

              {/* Circular Seal Placeholder */}
              <div
                className="w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-1 font-serif text-[7px] font-bold"
                style={{ borderColor: borderTintStrong, color: primaryColor }}
              >
                <span>★ SEAL ★</span>
                <span className="font-black text-[6.5px] uppercase">CONTROLLER OF EXAMS</span>
                <span>★ 2025 ★</span>
              </div>
            </div>
          </div>

          {/* Timetable Ledger */}
          <div className="space-y-1">
            <div className="font-serif font-bold text-xs uppercase tracking-wider text-center" style={{ color: primaryColor }}>
              Official Examination Schedule
            </div>
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: borderTintStrong }}>
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="text-white text-[10.5px] font-serif font-bold" style={{ backgroundColor: primaryColor }}>
                    <th className="py-1.5 px-2 border-r border-white/20 w-12">No.</th>
                    <th className="py-1.5 px-3 border-r border-white/20">Exam Date</th>
                    <th className="py-1.5 px-3 border-r border-white/20">Time</th>
                    <th className="py-1.5 px-3 border-r border-white/20 text-left">Subject / Course Paper</th>
                    <th className="py-1.5 px-3">Invigilator Initial</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub: any, sidx: number) => (
                    <tr
                      key={sidx}
                      className="border-b font-serif text-slate-800 text-[11px]"
                      style={{
                        borderColor: borderTint,
                        backgroundColor: sidx % 2 === 0 ? 'transparent' : bgTintSubtle
                      }}
                    >
                      <td className="py-1.5 border-r" style={{ borderColor: borderTint }}>{sidx + 1}</td>
                      <td className="py-1.5 border-r font-bold" style={{ borderColor: borderTint }}>{sub.date}</td>
                      <td className="py-1.5 border-r text-slate-600" style={{ borderColor: borderTint }}>{sub.fromTime} - {sub.toTime || '13:00'}</td>
                      <td className="py-1.5 px-3 border-r text-left font-bold" style={{ borderColor: borderTint, color: primaryColor }}>{sub.subjectName}</td>
                      <td className="py-1.5"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Declaration */}
          <div className="mt-3 p-2 rounded border bg-slate-50 text-[8.5px] text-slate-600 font-serif italic text-center" style={{ borderColor: borderTint }}>
            "I hereby certify that the candidate whose photograph and particulars appear above has fulfilled all institutional examination prerequisites and is permitted to sit for the scheduled papers."
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 text-center mt-7 pt-2 text-[8.5px] font-serif font-black uppercase text-slate-700">
            <div>
              <div className="w-[80%] mx-auto h-0.5 border-t border-dashed border-slate-400 mb-1" />
              <span>Candidate Signature</span>
            </div>
            <div>
              <div className="w-[80%] mx-auto h-0.5 border-t border-dashed border-slate-400 mb-1" />
              <span>Invigilator In-Charge</span>
            </div>
            <div>
              <div className="w-[80%] mx-auto h-0.5 border-t border-dashed border-slate-400 mb-1" />
              <span>Head of Institution / Principal</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE 4: COMPACT MINIMALIST (Fast Print / Detachable Stub Format)        */}
      {/* ========================================================================= */}
      {templateType === 'compact' && (
        <div className="p-5 border-2 flex flex-col justify-between text-slate-900" style={{ borderColor: primaryColor }}>
          {/* Top Barcode Header */}
          <div>
            <div className="flex justify-between items-start pb-2 border-b" style={{ borderColor: borderTintStrong }}>
              <div>
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight" style={{ color: primaryColor }}>
                  {schoolName}
                </h1>
                <p className="text-[9.5px] text-slate-600 font-semibold">{schoolAddress}</p>
                <div className="text-[9px] font-bold text-slate-700 mt-0.5">
                  Center: Cosmopolitan Examination Center (Code: 104)
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                {/* Simulated Barcode */}
                <div className="font-mono tracking-widest text-xs font-black text-slate-900 flex flex-col items-center">
                  <div className="h-6 w-32 bg-slate-900 flex items-center justify-around px-1">
                    {[4, 2, 5, 2, 6, 3, 2, 5, 4, 2, 6, 3, 4].map((w, idx) => (
                      <span key={idx} className="bg-white h-full" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <span className="text-[8px] mt-0.5 font-bold tracking-widest text-slate-600">*10104-ADM089*</span>
                </div>
              </div>
            </div>

            {/* Title Bar */}
            <div
              className="my-2 px-3 py-1 text-white text-[10.5px] font-black uppercase flex items-center justify-between rounded"
              style={{ backgroundColor: primaryColor }}
            >
              <span>{admitLabel} // {examName}</span>
              <span>SESSION: {session}</span>
            </div>

            {/* 3-Section Candidate Card */}
            <div className="grid grid-cols-12 gap-3 p-2.5 rounded-lg border bg-slate-50/70 text-xs mb-3" style={{ borderColor: borderTint }}>
              {/* Left Info */}
              <div className="col-span-5 space-y-1">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Candidate Name</span>
                  <span className="font-black text-slate-900" style={{ color: primaryColor }}>Aarav Sharma</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div>
                    <span className="text-[8.5px] text-slate-500 font-bold uppercase block">Roll No.</span>
                    <span className="font-black text-slate-900">10104</span>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-500 font-bold uppercase block">Class</span>
                    <span className="font-bold text-slate-800">{classNameStr} - A</span>
                  </div>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-500 font-bold uppercase block">Father's Name</span>
                  <span className="font-semibold text-slate-800">Rajesh Sharma</span>
                </div>
              </div>

              {/* Middle Venue Info */}
              <div className="col-span-4 border-l pl-3 space-y-1" style={{ borderColor: borderTint }}>
                <div>
                  <span className="text-[8.5px] text-slate-500 font-bold uppercase block">Reporting Time</span>
                  <span className="font-bold text-slate-900">09:30 AM IST</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-500 font-bold uppercase block">Gate Closure</span>
                  <span className="font-bold text-rose-700">09:50 AM (Sharp)</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-500 font-bold uppercase block">Room / Hall</span>
                  <span className="font-bold text-slate-900">Hall No. 3 (2nd Floor)</span>
                </div>
              </div>

              {/* Right Photo */}
              <div className="col-span-3 flex flex-col items-center justify-center border-l pl-3" style={{ borderColor: borderTint }}>
                <div
                  className="w-20 h-24 border rounded bg-white flex flex-col items-center justify-center text-center p-1 shadow-2xs"
                  style={{ borderColor: primaryColor }}
                >
                  <User className="w-6 h-6 text-slate-400 mb-0.5" />
                  <span className="text-[7px] uppercase font-bold text-slate-500">Student Photo</span>
                </div>
                <span className="text-[7px] font-bold text-slate-400 mt-1 uppercase">Specimen ID</span>
              </div>
            </div>

            {/* Timetable Matrix */}
            <div className="border rounded overflow-hidden" style={{ borderColor: borderTintStrong }}>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="text-white text-[9.5px] font-black uppercase" style={{ backgroundColor: primaryColor }}>
                    <th className="py-1 px-2">#</th>
                    <th className="py-1 px-2">Exam Date</th>
                    <th className="py-1 px-2">Slot</th>
                    <th className="py-1 px-2">Subject</th>
                    <th className="py-1 px-2 text-center">Invigilator Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: borderTint }}>
                  {subjects.map((sub: any, sidx: number) => (
                    <tr key={sidx} className="text-[10.5px] font-semibold text-slate-800">
                      <td className="py-1 px-2 text-slate-500">{sidx + 1}</td>
                      <td className="py-1 px-2 font-bold">{sub.date}</td>
                      <td className="py-1 px-2 text-slate-600">{sub.fromTime} - {sub.toTime || '13:00'}</td>
                      <td className="py-1 px-2 font-bold" style={{ color: primaryColor }}>{sub.subjectName}</td>
                      <td className="py-1 px-2 text-center">
                        <span className="inline-block w-16 h-3.5 border border-dashed rounded bg-slate-50" style={{ borderColor: borderTint }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Concise Instructions */}
            <div className="mt-2 text-[8px] text-slate-500 leading-tight">
              <strong>Rules:</strong> Entry without this ticket and institutional photo ID is strictly denied. No smart devices or unauthorized papers permitted.
            </div>
          </div>

          {/* Perforated Divider Line */}
          <div className="my-4 flex items-center justify-between text-slate-400">
            <span className="h-[1px] flex-1 border-t-2 border-dashed border-slate-300" />
            <span className="px-3 flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-slate-500">
              <Scissors className="w-3 h-3 text-slate-400" /> Detachable Invigilator Attendance Slip
            </span>
            <span className="h-[1px] flex-1 border-t-2 border-dashed border-slate-300" />
          </div>

          {/* Tear-Off Invigilator Stub */}
          <div
            className="p-3 rounded-lg border bg-slate-50/60 flex items-center justify-between text-xs"
            style={{ borderColor: borderTint }}
          >
            <div className="space-y-0.5">
              <div className="text-[8.5px] font-black uppercase text-slate-400">Exam Hall Copy</div>
              <div className="text-xs font-black text-slate-900" style={{ color: primaryColor }}>
                Aarav Sharma • Roll: 10104 ({classNameStr})
              </div>
              <div className="text-[9px] text-slate-600 font-semibold">
                Exam: {examName} • Date: {subjects[0]?.date || '2025-03-21'}
              </div>
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <div className="w-20 h-0.5 border-t border-dashed border-slate-400 mb-1" />
                <span className="text-[7.5px] font-black uppercase text-slate-600">Candidate Sign</span>
              </div>
              <div>
                <div className="w-20 h-0.5 border-t border-dashed border-slate-400 mb-1" />
                <span className="text-[7.5px] font-black uppercase text-slate-600">Invigilator Sign</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const AdmitCardModalPreview: React.FC<AdmitCardModalPreviewProps> = ({ card, customSubjects, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null)

  if (!card) return null

  const handlePrint = () => {
    setTimeout(() => {
      window.print()
    }, 200)
  }

  const primaryColor = card.themeColor || '#1e3a8a'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-admit-card-container, #printable-admit-card-container * {
            visibility: visible !important;
          }
          #printable-admit-card-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12px !important;
            background: white !important;
          }
        }
      `}</style>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl w-full max-w-[880px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto">
        
        {/* Modal Top Control Bar */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Live Admit Card • Examination Hall Ticket
                </h3>
                <span
                  className="px-2 py-0.5 rounded text-[8px] font-black text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {card.templateStyle || 'Classic Board'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Exam: <span className="font-bold text-slate-700 dark:text-slate-300">{card.examName}</span> • Class: <span className="font-bold text-teal-600">{card.className}</span> ({card.session})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 hover:opacity-90 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              <Printer className="w-3.5 h-3.5" />
              Print Admit Card
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Template Paper Scroll Container */}
        <div className="overflow-auto bg-slate-200/60 dark:bg-slate-950 p-4 sm:p-6 flex-1 flex justify-center items-start">
          <div ref={printRef} className="w-full flex justify-center">
            <AdmitCardPaper card={card} customSubjects={customSubjects} />
          </div>
        </div>

        {/* Modal Footer Info */}
        <div className="px-6 py-3 bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Admit Card ID: #{card.id} • Status: <strong className="text-emerald-600">{card.status}</strong></span>
          <span className="text-[11px] font-semibold text-teal-600">Simultaneously synced with Exam Setup</span>
        </div>

      </div>
    </div>
  )
}

export interface AdmitCardMiniPreviewProps {
  template: 'Classic Board' | 'Modern Split Pass' | 'Executive Heritage' | 'Compact Minimalist' | string
  themeColor?: string
  schoolName?: string
  studentName?: string
  className?: string
  rollNo?: string
  examName?: string
  session?: string
  isSelected?: boolean
}

export const AdmitCardMiniPreview: React.FC<AdmitCardMiniPreviewProps> = ({
  template,
  themeColor = '#1e3a8a',
  schoolName = 'DELHI PUBLIC SCHOOL',
  studentName = 'Aarav Sharma',
  className: studentClass = 'Class X',
  rollNo = '10104',
  examName = 'Final Term Exam',
  session = '2025-26',
  isSelected = false
}) => {
  const styleRaw = (template || 'Classic Board').toLowerCase()
  let type: 'classic' | 'modern' | 'executive' | 'compact' = 'classic'
  if (styleRaw.includes('modern') || styleRaw.includes('split') || styleRaw.includes('emerald') || styleRaw.includes('dual')) {
    type = 'modern'
  } else if (styleRaw.includes('executive') || styleRaw.includes('heritage') || styleRaw.includes('crimson') || styleRaw.includes('crest')) {
    type = 'executive'
  } else if (styleRaw.includes('compact') || styleRaw.includes('minimal') || styleRaw.includes('slate') || styleRaw.includes('stub')) {
    type = 'compact'
  }

  const primary = themeColor || '#1e3a8a'
  const tintLight = hexToRgba(primary, 0.06)
  const tintMed = hexToRgba(primary, 0.12)
  const borderTint = hexToRgba(primary, 0.3)

  return (
    <div
      className={`w-full h-36 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border transition-all duration-300 relative flex flex-col justify-between text-slate-800 dark:text-slate-100 select-none ${
        isSelected
          ? 'shadow-md ring-2 ring-teal-500/50 scale-[1.01]'
          : 'shadow-2xs hover:shadow-xs'
      }`}
      style={{
        borderColor: isSelected ? primary : borderTint
      }}
    >
      {/* 1. CLASSIC BOARD MINI PREVIEW */}
      {type === 'classic' && (
        <div
          className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900"
          style={{ border: `2px double ${primary}` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-1" style={{ borderColor: borderTint }}>
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full border flex items-center justify-center text-[5.5px] font-black shrink-0"
                style={{ borderColor: primary, color: primary, backgroundColor: tintLight }}
              >
                ESTD
              </div>
              <div>
                <div className="text-[7.5px] font-black leading-tight uppercase truncate max-w-[120px]" style={{ color: primary }}>
                  {schoolName}
                </div>
                <div className="text-[5px] text-slate-500 font-semibold leading-none">Affil. to CBSE Board • Code: 123456</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[4.5px] font-black uppercase px-1 py-0.5 rounded text-white" style={{ backgroundColor: primary }}>
                BOARD
              </span>
              <QrCode className="w-3.5 h-3.5 text-slate-700 mt-0.5" />
            </div>
          </div>

          {/* Title Strip */}
          <div
            className="w-full text-center py-0.5 rounded text-[6px] font-black uppercase text-white shadow-2xs my-0.5"
            style={{ backgroundColor: primary }}
          >
            ADMIT CARD • {examName} ({session})
          </div>

          {/* Candidate & Photo */}
          <div className="flex gap-1.5 items-center my-0.5">
            <div className="flex-1 grid grid-cols-2 gap-x-1 gap-y-0.5 text-[5.5px]">
              <div><span className="text-slate-400 font-bold">NAME: </span><span className="font-black text-slate-900" style={{ color: primary }}>{studentName}</span></div>
              <div><span className="text-slate-400 font-bold">ROLL: </span><span className="font-black text-slate-900">{rollNo}</span></div>
              <div><span className="text-slate-400 font-bold">CLASS: </span><span className="font-bold text-slate-800">{studentClass} - A</span></div>
              <div><span className="text-slate-400 font-bold">ADM: </span><span className="font-bold text-slate-800">ADM-089</span></div>
            </div>

            {/* Photo Box */}
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <div className="w-6 h-7 rounded border border-dashed flex flex-col items-center justify-center bg-slate-50 text-[5px] text-slate-400" style={{ borderColor: borderTint }}>
                <User className="w-3 h-3 text-slate-400" />
              </div>
              <span className="text-[4px] font-bold text-slate-500 uppercase leading-none">SPECIMEN SIGN</span>
            </div>
          </div>

          {/* Mini Table */}
          <div className="border rounded overflow-hidden" style={{ borderColor: borderTint }}>
            <div className="flex text-[5px] font-black text-white px-1 py-0.5 justify-between" style={{ backgroundColor: primary }}>
              <span className="w-12">Exam Date</span>
              <span className="flex-1 pl-1">Subject</span>
              <span className="w-10 text-right">Sign</span>
            </div>
            <div className="flex text-[5px] font-semibold text-slate-700 px-1 py-0.5 justify-between border-b" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
              <span className="w-12 font-bold">21 Mar 2025</span>
              <span className="flex-1 pl-1 font-bold text-slate-900">English Core</span>
              <span className="w-10 text-right text-slate-400">[ &nbsp; &nbsp; ]</span>
            </div>
            <div className="flex text-[5px] font-semibold text-slate-700 px-1 py-0.5 justify-between">
              <span className="w-12 font-bold">23 Mar 2025</span>
              <span className="flex-1 pl-1 font-bold text-slate-900">Mathematics</span>
              <span className="w-10 text-right text-slate-400">[ &nbsp; &nbsp; ]</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-center pt-0.5 text-[4.5px] font-black uppercase text-slate-500 border-t" style={{ borderColor: borderTint }}>
            <span>Candidate Sign</span>
            <span>Invigilator Sign</span>
            <span>Principal & Stamp</span>
          </div>
        </div>
      )}

      {/* 2. MODERN SPLIT PASS MINI PREVIEW */}
      {type === 'modern' && (
        <div className="w-full h-full flex bg-white text-slate-900 border" style={{ borderColor: primary }}>
          {/* Left Column Profile Sidebar */}
          <div
            className="w-[34%] p-1.5 flex flex-col justify-between border-r text-center"
            style={{ backgroundColor: tintLight, borderColor: borderTint }}
          >
            <div className="space-y-1 flex flex-col items-center">
              <span className="text-[4.5px] font-black uppercase px-1 py-0.5 rounded text-white shadow-2xs" style={{ backgroundColor: primary }}>
                VERIFIED PASS
              </span>

              {/* Photo */}
              <div className="w-7 h-8 rounded border p-0.5 bg-white shadow-2xs flex flex-col items-center justify-center" style={{ borderColor: primary }}>
                <User className="w-4 h-4 text-slate-400" />
              </div>

              {/* Roll No */}
              <div className="w-full rounded px-1 py-0.5 text-white shadow-2xs" style={{ backgroundColor: primary }}>
                <div className="text-[4px] font-bold text-white/80">ROLL NO</div>
                <div className="text-[8px] font-black leading-tight tracking-wider">{rollNo}</div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <QrCode className="w-5 h-5 text-slate-800" />
              <span className="text-[4px] font-mono text-slate-400 mt-0.5">#ADM-089</span>
            </div>
          </div>

          {/* Right Column Body */}
          <div className="flex-1 p-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between border-b pb-1" style={{ borderColor: borderTint }}>
                <div>
                  <div className="text-[7.5px] font-black uppercase leading-tight truncate max-w-[110px]" style={{ color: primary }}>
                    {schoolName}
                  </div>
                  <div className="text-[5px] text-slate-500 font-semibold">{examName}</div>
                </div>
                <span className="text-[5px] font-black uppercase px-1 py-0.5 rounded text-white" style={{ backgroundColor: primary }}>
                  HALL TICKET
                </span>
              </div>

              {/* Pill Cards */}
              <div className="grid grid-cols-2 gap-1 my-1">
                <div className="p-0.5 rounded border bg-slate-50 text-[5px]" style={{ borderColor: borderTint }}>
                  <div className="text-[4px] text-slate-400 font-bold uppercase">NAME</div>
                  <div className="font-black text-slate-900 truncate" style={{ color: primary }}>{studentName}</div>
                </div>
                <div className="p-0.5 rounded border bg-slate-50 text-[5px]" style={{ borderColor: borderTint }}>
                  <div className="text-[4px] text-slate-400 font-bold uppercase">CLASS</div>
                  <div className="font-bold text-slate-800 truncate">{studentClass} - Sec A</div>
                </div>
              </div>

              {/* Mini Timetable */}
              <div className="border rounded-md overflow-hidden text-[5px]" style={{ borderColor: borderTint }}>
                <div className="px-1 py-0.5 font-black text-white flex justify-between" style={{ backgroundColor: primary }}>
                  <span>Subject Schedule</span>
                  <span>Time</span>
                </div>
                <div className="px-1 py-0.5 flex justify-between font-semibold border-b text-slate-700" style={{ borderColor: borderTint }}>
                  <span className="font-bold">English Core</span>
                  <span className="text-slate-500">10:00 - 13:00</span>
                </div>
                <div className="px-1 py-0.5 flex justify-between font-semibold text-slate-700 bg-slate-50/50">
                  <span className="font-bold">Mathematics</span>
                  <span className="text-slate-500">10:00 - 13:00</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-center text-[4.5px] font-black text-slate-500 pt-0.5 border-t" style={{ borderColor: borderTint }}>
              <span>Class Teacher Sign</span>
              <span className="font-bold" style={{ color: primary }}>Principal Verified ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXECUTIVE HERITAGE MINI PREVIEW */}
      {type === 'executive' && (
        <div
          className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900 relative"
          style={{ border: `3px double ${primary}` }}
        >
          {/* Corner Marks */}
          <span className="absolute top-0.5 left-0.5 text-[5px] font-serif" style={{ color: primary }}>◆</span>
          <span className="absolute top-0.5 right-0.5 text-[5px] font-serif" style={{ color: primary }}>◆</span>
          <span className="absolute bottom-0.5 left-0.5 text-[5px] font-serif" style={{ color: primary }}>◆</span>
          <span className="absolute bottom-0.5 right-0.5 text-[5px] font-serif" style={{ color: primary }}>◆</span>

          {/* Centered Crest Header */}
          <div className="text-center border-b pb-1" style={{ borderColor: borderTint }}>
            <div className="flex justify-center items-center gap-1">
              <Award className="w-3.5 h-3.5" style={{ color: primary }} />
              <span className="text-[7.5px] font-black uppercase font-serif tracking-wider" style={{ color: primary }}>
                {schoolName}
              </span>
            </div>
            <div className="text-[4.5px] font-serif text-slate-500 italic mt-0.5">Autonomous Academic Institution • Founded 2010</div>
            <div
              className="inline-block px-2 py-0.5 rounded-full text-white text-[5.5px] font-serif font-black uppercase tracking-wider mt-0.5 shadow-2xs"
              style={{ backgroundColor: primary }}
            >
              EXAMINATION HALL TICKET • {session}
            </div>
          </div>

          {/* Candidate Block */}
          <div className="flex items-center gap-1.5 p-1 rounded border bg-slate-50/60 my-0.5" style={{ borderColor: borderTint }}>
            <div className="flex-1 grid grid-cols-2 gap-x-1 gap-y-0.5 text-[5px] font-serif">
              <div><span className="text-slate-500 font-bold">NAME: </span><span className="font-black text-slate-900" style={{ color: primary }}>{studentName}</span></div>
              <div><span className="text-slate-500 font-bold">ROLL: </span><span className="font-black text-slate-900">{rollNo}</span></div>
              <div><span className="text-slate-500 font-bold">CLASS: </span><span className="font-bold text-slate-800">{studentClass}</span></div>
              <div><span className="text-slate-500 font-bold">ADM: </span><span className="font-bold text-slate-800">ADM-089</span></div>
            </div>

            {/* Photo & Seal */}
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-6 h-7 rounded border border-double flex items-center justify-center bg-white" style={{ borderColor: primary }}>
                <User className="w-3 h-3 text-slate-400" />
              </div>
              <div className="w-5 h-5 rounded-full border border-dashed flex flex-col items-center justify-center text-[4px] font-serif font-black text-center leading-none" style={{ borderColor: primary, color: primary }}>
                <span>★</span>
                <span>SEAL</span>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="border rounded overflow-hidden text-[5px] font-serif" style={{ borderColor: borderTint }}>
            <div className="flex justify-between px-1 py-0.5 text-white font-black" style={{ backgroundColor: primary }}>
              <span>Paper / Course</span>
              <span>Date</span>
              <span>Invigilator</span>
            </div>
            <div className="flex justify-between px-1 py-0.5 border-b font-semibold text-slate-700" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
              <span className="font-bold">English Core</span>
              <span>21-Mar-2025</span>
              <span className="text-slate-400">[ &nbsp; &nbsp; ]</span>
            </div>
            <div className="flex justify-between px-1 py-0.5 font-semibold text-slate-700">
              <span className="font-bold">Mathematics</span>
              <span>23-Mar-2025</span>
              <span className="text-slate-400">[ &nbsp; &nbsp; ]</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-center text-[4.5px] font-serif font-black uppercase text-slate-600 pt-0.5 border-t" style={{ borderColor: borderTint }}>
            <span>Candidate Sign</span>
            <span>Superintendent</span>
            <span>Head of Institution</span>
          </div>
        </div>
      )}

      {/* 4. COMPACT MINIMALIST MINI PREVIEW */}
      {type === 'compact' && (
        <div className="w-full h-full p-1.5 flex flex-col justify-between bg-white text-slate-900 border" style={{ borderColor: primary }}>
          {/* Top Barcode Header */}
          <div>
            <div className="flex justify-between items-start border-b pb-0.5" style={{ borderColor: borderTint }}>
              <div>
                <div className="text-[7.5px] font-black uppercase leading-tight truncate max-w-[120px]" style={{ color: primary }}>
                  {schoolName}
                </div>
                <div className="text-[4.5px] text-slate-500 font-bold">Venue: Center 104 • Hall 3</div>
              </div>
              {/* Barcode Graphic */}
              <div className="flex flex-col items-end">
                <div className="h-2.5 w-14 bg-slate-900 flex items-center justify-around px-0.5">
                  {[2, 1, 2, 1, 3, 1, 2, 2, 1, 3].map((w, idx) => (
                    <span key={idx} className="bg-white h-full" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <span className="text-[4px] font-mono font-bold text-slate-500">*{rollNo}*</span>
              </div>
            </div>

            {/* High-Contrast Bar */}
            <div className="my-0.5 px-1 py-0.5 text-white text-[5.5px] font-black uppercase flex justify-between rounded" style={{ backgroundColor: primary }}>
              <span>ADMIT PASS // {session}</span>
              <span>{examName}</span>
            </div>

            {/* 3-Col Compact Block */}
            <div className="grid grid-cols-12 gap-1 p-1 rounded border bg-slate-50/70 text-[5px] my-0.5" style={{ borderColor: borderTint }}>
              <div className="col-span-6 space-y-0.5">
                <div><span className="text-slate-400 font-bold">NAME: </span><span className="font-black text-slate-900" style={{ color: primary }}>{studentName}</span></div>
                <div><span className="text-slate-400 font-bold">ROLL: </span><span className="font-bold text-slate-900">{rollNo} ({studentClass})</span></div>
              </div>
              <div className="col-span-4 border-l pl-1 space-y-0.5" style={{ borderColor: borderTint }}>
                <div><span className="text-slate-400 font-bold">REPORT: </span><span className="font-bold text-slate-900">09:30 AM</span></div>
                <div><span className="text-slate-400 font-bold">GATE: </span><span className="font-bold text-rose-700">09:50 AM</span></div>
              </div>
              <div className="col-span-2 flex items-center justify-center border-l pl-0.5" style={{ borderColor: borderTint }}>
                <div className="w-5 h-6 rounded border bg-white flex items-center justify-center" style={{ borderColor: primary }}>
                  <User className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Compact Table */}
            <div className="border rounded overflow-hidden text-[5px]" style={{ borderColor: borderTint }}>
              <div className="flex justify-between px-1 py-0.5 font-black text-white" style={{ backgroundColor: primary }}>
                <span>Date & Paper</span>
                <span>Slot</span>
                <span>Verification</span>
              </div>
              <div className="flex justify-between px-1 py-0.5 font-semibold text-slate-700 border-b" style={{ borderColor: borderTint }}>
                <span className="font-bold">21 Mar • English</span>
                <span>10:00 AM</span>
                <span className="text-slate-400">[ &nbsp; &nbsp; ]</span>
              </div>
            </div>
          </div>

          {/* Detachable Scissor Line & Stub */}
          <div>
            <div className="flex items-center justify-between text-slate-400 my-0.5">
              <span className="h-[1px] flex-1 border-t border-dashed border-slate-300" />
              <span className="px-1 text-[4px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-0.5">
                <Scissors className="w-2 h-2 text-slate-400" /> DETACHABLE ATTENDANCE STUB
              </span>
              <span className="h-[1px] flex-1 border-t border-dashed border-slate-300" />
            </div>

            <div className="p-1 rounded border bg-slate-50 flex items-center justify-between text-[4.5px]" style={{ borderColor: borderTint }}>
              <div>
                <span className="font-black text-slate-900" style={{ color: primary }}>{studentName}</span>
                <span className="text-slate-500"> • Roll: {rollNo}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500">Candidate Sign [_____]</span>
                <span className="text-slate-500">Invigilator [_____]</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


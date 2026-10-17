'use client'

import React from 'react'
import { Award, CheckCircle2, ShieldCheck, QrCode, Sparkles, School, Star, BookOpen, Heart, Activity, Palette, Compass, Trophy, User, Check } from 'lucide-react'

// Helper: convert hex to rgba
export function hexToRgba(hex: string, alpha: number): string {
  let c = (hex || '#065f46').replace('#', '')
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('')
  }
  const num = parseInt(c, 16)
  if (isNaN(num)) return `rgba(6, 95, 70, ${alpha})`
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export interface MarksheetPreviewProps {
  templateName?: string
  themeColor?: string
  schoolName?: string
  affiliateTo?: string
  schoolAddress?: string
  schoolCode?: string
  phone?: string
  email?: string
  principalName?: string
  academicYear?: string
  examName?: string
  headingHeader?: string
  className?: string
  sectionName?: string
  studentName?: string
  rollNo?: string
  admissionNo?: string
  fatherName?: string
  motherName?: string
  dob?: string
  attendance?: string
  subjects?: Array<{
    id?: number | string
    subjectName: string
    maxMarks?: string | number
    practicalColumn?: boolean
    practicalMarks?: string | number
    obtainedMarks?: string | number
    grade?: string
  }>
  percentRanges?: Array<{ range: string; remark: string }>
  gradeRanges?: Array<{ range: string; grade: string }>
  divisionRanges?: Array<{ range: string; div: string }>
  showStudentPhoto?: boolean
  showRoundBorderPhoto?: boolean
  showTestMarks?: boolean
  showHeaderSign?: boolean
  showHeaderStamp?: boolean
  columnsList?: Record<string, boolean>
}

export const MarksheetPreview: React.FC<MarksheetPreviewProps> = ({
  templateName = 'CBSE Royal Emerald',
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  affiliateTo = 'Affiliated to CBSE, New Delhi • Affiliation No. 2130842',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi - 110092',
  schoolCode = '123456',
  phone = '+91 11 2345 6789',
  email = 'info@cosmopolitan.edu',
  principalName = 'Dr. Meenakshi Sundaram',
  academicYear = '2025-2026',
  examName = 'Annual Examination 2025-26',
  headingHeader = 'ANNUAL PROGRESS REPORT CARD',
  className = 'Class 10',
  sectionName = 'Section A',
  studentName = 'Rahul Verma',
  rollNo = '23',
  admissionNo = '4567',
  fatherName = 'Vikram Verma',
  motherName = 'Sunita Verma',
  dob = '12/05/2008',
  attendance = '188 / 200 Days (94%)',
  subjects = [
    { subjectName: 'English Communicative', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '90', grade: 'A1' },
    { subjectName: 'Hindi Course-A', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '90', grade: 'A1' },
    { subjectName: 'Mathematics Standard', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '93', grade: 'A1' },
    { subjectName: 'Science', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '88', grade: 'A1' },
    { subjectName: 'Social Science', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '88', grade: 'A1' },
    { subjectName: 'Information Technology', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '90', grade: 'A1' }
  ],
  percentRanges = [
    { range: '91-100', remark: 'Outstanding' },
    { range: '81-90', remark: 'Excellent' },
    { range: '71-80', remark: 'Very Good' },
    { range: '61-70', remark: 'Good' },
    { range: '33-60', remark: 'Satisfactory' }
  ],
  gradeRanges = [
    { range: '91-100', grade: 'A1' },
    { range: '81-90', grade: 'A2' },
    { range: '71-80', grade: 'B1' },
    { range: '61-70', grade: 'B2' },
    { range: '51-60', grade: 'C1' },
    { range: '41-50', grade: 'C2' },
    { range: '33-40', grade: 'D' }
  ],
  showStudentPhoto = true,
  showRoundBorderPhoto = true,
  showTestMarks = true,
  showHeaderSign = true,
  showHeaderStamp = true,
  columnsList = {
    rollNumber: true, motherName: true, fatherName: true, admissionNo: true,
    classSection: true, dob: true, attendance: true, examDate: true, dateOfIssue: true
  }
}) => {
  // Ensure fallback subjects
  const activeSubjects = subjects && subjects.length > 0 ? subjects : [
    { subjectName: 'English Communicative', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '90', grade: 'A1' },
    { subjectName: 'Mathematics Standard', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '93', grade: 'A1' },
    { subjectName: 'Science', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '88', grade: 'A1' },
    { subjectName: 'Social Science', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '88', grade: 'A1' },
    { subjectName: 'Information Technology', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '90', grade: 'A1' }
  ]

  const totalMax = activeSubjects.reduce((acc, s) => acc + (Number(s.maxMarks) || 100), 0)
  const totalObt = activeSubjects.reduce((acc, s) => acc + (Number(s.obtainedMarks) || 88), 0)
  const percentage = ((totalObt / totalMax) * 100).toFixed(1)

  const normalized = (templateName || '').toLowerCase()

  // Detect which template style to render
  const isMinimalModern = normalized.includes('minimal') || normalized.includes('modern') || normalized.includes('canva')
  const isDualTerm = normalized.includes('dual') || normalized.includes('term') || normalized.includes('icse') || normalized.includes('consolidated') || normalized.includes('maroon') || normalized.includes('scholastic')
  const isHolisticSkills = normalized.includes('holistic') || normalized.includes('skills') || normalized.includes('early') || normalized.includes('kindergarten') || normalized.includes('primary') || normalized.includes('grid') || normalized.includes('indigo')
  // Default is CBSE Royal Emerald
  const isCbseRoyal = !isMinimalModern && !isDualTerm && !isHolisticSkills

  // Color derivation
  const defaultBaseColor = isMinimalModern ? '#0f766e' : isDualTerm ? '#660033' : isHolisticSkills ? '#0284c7' : '#065f46'
  const primary = themeColor || defaultBaseColor
  const tintLight = hexToRgba(primary, 0.08)
  const tintMed = hexToRgba(primary, 0.16)
  const borderTint = hexToRgba(primary, 0.3)

  // =========================================================================
  // TEMPLATE 2: MINIMALIST MODERN (CANVA / PINTEREST STYLE - TEAL & SLATE)
  // =========================================================================
  if (isMinimalModern) {
    return (
      <div className="w-full max-w-[780px] bg-white text-slate-800 rounded-3xl shadow-2xl p-7 md:p-9 font-sans border select-none" style={{ borderColor: borderTint }}>
        {/* Header */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5 font-black text-lg md:text-xl tracking-tight uppercase" style={{ color: primary }}>
            <School className="w-7 h-7" style={{ color: primary }} />
            <span>{schoolName}</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {headingHeader || 'STUDENT REPORT CARD'} • ACADEMIC YEAR {academicYear}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">{affiliateTo}</p>
        </div>

        {/* Student Profile & Attendance Gauge Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          {/* Profile Card */}
          <div className="sm:col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
            {showStudentPhoto && (
              <div className="w-16 h-16 rounded-full bg-teal-100 border-2 border-teal-500 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentName)}`}
                  alt={studentName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Student Profile</span>
              <h3 className="text-base font-black text-slate-900 leading-tight">{studentName}</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-600 mt-1">
                <span>Class: <strong className="text-slate-900">{className} {sectionName ? `(${sectionName})` : ''}</strong></span>
                <span>Roll: <strong className="text-slate-900">{rollNo}</strong></span>
                <span>ID: <strong className="text-slate-900">{admissionNo}</strong></span>
              </div>
            </div>
          </div>

          {/* Attendance Indicator Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Attendance Indicator</span>
            <div className="text-xl font-black text-teal-700 mt-1">96%</div>
            <span className="text-[10px] font-semibold text-slate-500">175 / 182 Days</span>
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
              ✓ On Track
            </span>
          </div>
        </div>

        {/* Modern Academic Performance Table with Progress Bars */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs mb-6">
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between text-xs font-black uppercase tracking-wider">
            <span>Modern Academic Performance</span>
            <span className="text-teal-400 font-semibold">{examName}</span>
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {activeSubjects.map((sub, i) => {
              const max = Number(sub.maxMarks) || 100
              const obt = Number(sub.obtainedMarks) || Math.floor(84 + (i * 3) % 14)
              const pct = Math.min(100, Math.round((obt / max) * 100))
              const grade = sub.grade || (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : 'B')
              return (
                <div key={i} className="p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3 sm:w-1/3">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {sub.subjectName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 block leading-tight">{sub.subjectName}</span>
                      <span className="text-[10px] text-slate-400">{sub.practicalColumn ? 'Theory + Practical' : 'Theory Core'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:w-2/3 justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-slate-900">{obt}</span>
                      <span className="text-[10px] text-slate-400">/{max}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-700 ml-1">
                        {grade}
                      </span>
                    </div>

                    {/* Sleek Progress Bar */}
                    <div className="flex items-center gap-2.5 flex-1 max-w-[200px]">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* GPA & Percentage Pill Badges */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-600 text-white shadow-xs">
              PERCENTAGE: {percentage}%
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-800 text-white shadow-xs">
              CGPA: {((Number(percentage) / 100) * 4).toFixed(1)} / 4.0
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
              GRADE: A+
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Score</span>
            <span className="text-sm font-black text-slate-900">{totalObt} / {totalMax}</span>
          </div>
        </div>

        {/* Overall Remarks */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Overall Remarks</span>
          <p className="text-xs font-medium text-slate-700 italic">
            "Rahul is a dedicated, hardworking student with excellent academic performance and leadership qualities. Best wishes for continued success!"
          </p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100 text-center">
          <div className="flex flex-col items-center">
            <div className="h-9 flex items-end justify-center font-serif italic text-slate-700 text-sm font-bold border-b border-slate-300 w-40 pb-1">
              {principalName}
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 mt-1">Principal's Signature</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-9 flex items-end justify-center font-cursive italic text-slate-700 text-sm font-bold border-b border-slate-300 w-40 pb-1">
              Preeti Saxena
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 mt-1">Class Teacher's Signature</span>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // TEMPLATE 3: DUAL-TERM CONSOLIDATED (ICSE & STATE BOARD COMPARATIVE FORMAT)
  // =========================================================================
  if (isDualTerm) {
    return (
      <div className="w-full max-w-[800px] bg-white text-slate-900 shadow-2xl p-7 md:p-9 font-serif border-[10px] border-[#660033] select-none">
        <div className="border-2 border-[#1e3a8a] p-5 md:p-7 bg-[#fffdf9]">
          
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-[#660033]">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#660033] flex items-center justify-center bg-[#660033] text-white">
                <School className="w-7 h-7" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black uppercase text-[#660033] tracking-wide">
                {schoolName}
              </h1>
            </div>
            <p className="text-xs font-bold text-slate-600 tracking-wider uppercase mt-1">
              {affiliateTo} • SCHOOL CODE: {schoolCode}
            </p>
            <div className="inline-block mt-2 px-6 py-1 bg-[#1e3a8a] text-white font-sans font-black text-xs uppercase tracking-widest rounded-sm">
              ANNUAL ACADEMIC MARK SHEET {academicYear}
            </div>
          </div>

          {/* Student Profile Info Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3.5 border-b border-slate-300 text-xs font-sans">
            <div><span className="text-slate-400 font-bold uppercase text-[9px] block">Student Name:</span><strong className="text-slate-900">{studentName}</strong></div>
            <div><span className="text-slate-400 font-bold uppercase text-[9px] block">Class / Sec:</span><strong className="text-slate-900">{className} {sectionName ? `(${sectionName})` : ''}</strong></div>
            <div><span className="text-slate-400 font-bold uppercase text-[9px] block">Roll No:</span><strong className="text-slate-900">{rollNo}</strong></div>
            <div><span className="text-slate-400 font-bold uppercase text-[9px] block">Admin No:</span><strong className="text-slate-900">{admissionNo}</strong></div>
          </div>

          {/* Dual-Term Consolidated Table */}
          <div className="my-4 overflow-x-auto border-2 border-[#660033]">
            <div className="bg-[#1e3a8a] text-white text-center py-1.5 font-sans font-black text-xs uppercase tracking-wider">
              CONSOLIDATED ACADEMIC PERFORMANCE (TERM I & TERM II)
            </div>
            <table className="w-full text-[11px] text-center font-sans border-collapse">
              <thead>
                <tr className="bg-[#660033] text-white font-bold text-[10px]">
                  <th rowSpan={2} className="p-2 border-r border-white/20 text-left pl-3">SUBJECT</th>
                  <th colSpan={4} className="p-1 border-r border-white/20">TERM I</th>
                  <th colSpan={4} className="p-1 border-r border-white/20">TERM II</th>
                  <th rowSpan={2} className="p-2">GRAND TOTAL</th>
                </tr>
                <tr className="bg-[#831843] text-white font-semibold text-[9px]">
                  <th className="p-1 border-r border-white/20">PT 1 (20)</th>
                  <th className="p-1 border-r border-white/20">Half Yearly (80)</th>
                  <th className="p-1 border-r border-white/20">Subtotal</th>
                  <th className="p-1 border-r border-white/20">Grade</th>
                  <th className="p-1 border-r border-white/20">PT 2 (20)</th>
                  <th className="p-1 border-r border-white/20">Annual (80)</th>
                  <th className="p-1 border-r border-white/20">Subtotal</th>
                  <th className="p-1 border-r border-white/20">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeSubjects.map((sub, i) => {
                  const pt1 = 18 + (i % 3)
                  const hy = 72 + (i * 2) % 8
                  const t1 = pt1 + hy
                  const pt2 = 19 + (i % 2)
                  const ann = 74 + (i * 3) % 6
                  const t2 = pt2 + ann
                  const grandTotal = t1 + t2
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-2 text-left pl-3 font-bold text-slate-800 border-r border-slate-200">{sub.subjectName}</td>
                      <td className="p-1 border-r border-slate-200 text-slate-600">{pt1}</td>
                      <td className="p-1 border-r border-slate-200 text-slate-600">{hy}</td>
                      <td className="p-1 border-r border-slate-200 font-bold text-slate-900">{t1}</td>
                      <td className="p-1 border-r border-slate-200 font-bold text-teal-700">A1</td>
                      <td className="p-1 border-r border-slate-200 text-slate-600">{pt2}</td>
                      <td className="p-1 border-r border-slate-200 text-slate-600">{ann}</td>
                      <td className="p-1 border-r border-slate-200 font-bold text-slate-900">{t2}</td>
                      <td className="p-1 border-r border-slate-200 font-bold text-teal-700">A1</td>
                      <td className="p-1 font-black text-slate-900">{grandTotal} / 200</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Class Rank Badge & Result Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-4 my-4 font-sans">
            <div className="w-28 h-28 rounded-full bg-[#1e3a8a] text-white p-2 flex flex-col items-center justify-center text-center shadow-md shrink-0">
              <span className="text-[8px] font-black uppercase tracking-wider">CLASS RANK</span>
              <span className="text-3xl font-black">3</span>
              <span className="text-[9px] opacity-80">out of 45</span>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="bg-[#660033] text-white p-3 text-center font-black text-sm uppercase tracking-wider rounded-sm shadow-xs">
                RESULT: PASSED (DIVISION 1ST WITH DISTINCTION)
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="border border-slate-300 p-2 bg-slate-50">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">CO-SCHOLASTIC ASSESSMENT</span>
                  <span className="font-bold text-slate-800">Grade A (Exemplary)</span>
                </div>
                <div className="border border-slate-300 p-2 bg-slate-50">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">ATTENDANCE</span>
                  <span className="font-bold text-slate-800">218 / 225 Days (96.8%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grade Point Scale */}
          <div className="border border-slate-300 rounded-sm overflow-hidden text-[9px] text-center font-sans my-4">
            <div className="bg-[#660033] text-white font-bold py-1 uppercase tracking-wider">
              GRADE POINT SCALE
            </div>
            <div className="grid grid-cols-8 divide-x divide-slate-200 bg-white py-1">
              <div><strong>91-100:</strong> A+</div>
              <div><strong>81-90:</strong> A</div>
              <div><strong>71-80:</strong> B+</div>
              <div><strong>61-70:</strong> B</div>
              <div><strong>51-60:</strong> C+</div>
              <div><strong>41-50:</strong> C</div>
              <div><strong>33-40:</strong> D</div>
              <div><strong>&lt;33:</strong> E</div>
            </div>
          </div>

          {/* 4 Signatures */}
          <div className="grid grid-cols-4 gap-2 pt-6 border-t-2 border-[#660033] text-center font-sans text-[10px]">
            <div>
              <div className="h-8 border-b border-slate-400 font-serif italic font-bold">{principalName}</div>
              <span className="font-black uppercase text-slate-600 block mt-1">Principal</span>
            </div>
            <div>
              <div className="h-8 border-b border-slate-400 font-serif italic">Exam Board</div>
              <span className="font-black uppercase text-slate-600 block mt-1">Exam In-Charge</span>
            </div>
            <div>
              <div className="h-8 border-b border-slate-400 font-serif italic">Preeti Saxena</div>
              <span className="font-black uppercase text-slate-600 block mt-1">Class Teacher</span>
            </div>
            <div>
              <div className="h-8 border-b border-slate-400 font-serif italic">Guardian Sign</div>
              <span className="font-black uppercase text-slate-600 block mt-1">Parent / Guardian</span>
            </div>
          </div>

        </div>
      </div>
    )
  }

  // =========================================================================
  // TEMPLATE 4: HOLISTIC EARLY SKILLS (PRIMARY & KINDERGARTEN MONTESSORI FORMAT)
  // =========================================================================
  if (isHolisticSkills) {
    return (
      <div className="w-full max-w-[800px] bg-gradient-to-b from-sky-50 via-white to-amber-50 text-slate-800 rounded-3xl shadow-2xl p-7 md:p-9 font-sans border-4 border-sky-200 select-none">
        
        {/* Playful Header */}
        <div className="text-center pb-5 border-b-2 border-sky-200">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 font-black text-xs mb-2">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>ACADEMIC YEAR {academicYear}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-sky-800 tracking-tight">
            HOLISTIC SKILLS & DEVELOPMENTAL PROGRESS REPORT
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">{schoolName} • Primary & Kindergarten Section</p>
        </div>

        {/* Child Profile Ribbon */}
        <div className="bg-white border-2 border-dashed border-sky-300 rounded-2xl p-4 my-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            {showStudentPhoto && (
              <div className="w-18 h-18 rounded-full border-4 border-amber-400 overflow-hidden shadow-md shrink-0 flex items-center justify-center bg-amber-50">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentName + 'kid')}`}
                  alt={studentName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider block">Child's Name</span>
              <h3 className="text-xl font-black text-slate-900">{studentName}</h3>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600 mt-0.5">
                <span>Class: <strong className="text-sky-700">{className}</strong></span>
                <span>Teacher: <strong className="text-slate-800">Ms. Sarah Lee</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-sky-100 text-sky-900 text-center font-bold">
              <span className="text-[9px] uppercase block text-sky-600">Attendance</span>
              <span className="text-base font-black">96%</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-amber-100 text-amber-900 text-center font-bold">
              <span className="text-[9px] uppercase block text-amber-600">Student ID</span>
              <span className="text-base font-mono font-black">{admissionNo}</span>
            </div>
          </div>
        </div>

        {/* 4 Developmental Domain Cards with Star Ratings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          
          {/* 1. Language Skills */}
          <div className="bg-white border-2 border-sky-100 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-sky-800 font-black text-xs uppercase mb-3 pb-2 border-b border-sky-50">
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>1. Language & Literacy</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Listening & Speaking</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Phonics & Reading</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★☆</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">B+</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Creative Writing</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">A</span></div>
              </div>
            </div>
          </div>

          {/* 2. Numeracy */}
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase mb-3 pb-2 border-b border-amber-50">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>2. Numeracy & Logic</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Number Recognition</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Counting & Sorting</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★☆</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">B+</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Problem Solving</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">A</span></div>
              </div>
            </div>
          </div>

          {/* 3. Creative Arts */}
          <div className="bg-white border-2 border-pink-100 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-pink-800 font-black text-xs uppercase mb-3 pb-2 border-b border-pink-50">
              <Palette className="w-4 h-4 text-pink-600" />
              <span>3. Creative Expression & Arts</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Arts & Crafts</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Music & Movement</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800">Outstanding</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Dramatic Play</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">A</span></div>
              </div>
            </div>
          </div>

          {/* 4. Social Habits */}
          <div className="bg-white border-2 border-emerald-100 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase mb-3 pb-2 border-b border-emerald-50">
              <Heart className="w-4 h-4 text-emerald-600" />
              <span>4. Social Habits & Motor Skills</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Sharing & Kindness</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Listening to Instructions</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★☆</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">B+</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Gross & Fine Motor</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">A</span></div>
              </div>
            </div>
          </div>

        </div>

        {/* Achievement Ribbon & Teacher Quote */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 my-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-white flex flex-col items-center justify-center shadow-md shrink-0">
            <Trophy className="w-8 h-8" />
            <span className="text-[7.5px] font-black uppercase">WAY TO GO!</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Teacher's Encouraging Remarks</span>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">
              "{studentName} is a joyful and creative learner! They show great enthusiasm in collaborative group work and storytelling. Keep shining bright!"
            </p>
            <span className="text-[10px] text-amber-700 italic block mt-1">"Every child is a story waiting to be told."</span>
          </div>
        </div>

        {/* Parent Feedback & Signature */}
        <div className="pt-4 border-t-2 border-sky-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="h-8 border-b border-slate-300 font-cursive italic text-slate-700 text-sm">Parent Sign</div>
            <span className="text-[10px] font-bold uppercase text-slate-500 mt-1 block">Parent / Guardian Feedback & Signature</span>
          </div>
          <div>
            <div className="h-8 border-b border-slate-300 font-serif italic text-slate-700 text-sm">{principalName}</div>
            <span className="text-[10px] font-bold uppercase text-slate-500 mt-1 block">Principal / Headmistress</span>
          </div>
        </div>

      </div>
    )
  }

  // =========================================================================
  // TEMPLATE 1: CBSE ROYAL EMERALD & GOLD (OFFICIAL BOARD FORMAT) - DEFAULT
  // =========================================================================
  return (
    <div className="w-full max-w-[800px] bg-white text-slate-900 rounded-sm shadow-2xl p-7 md:p-9 font-sans border-8 select-none" style={{ borderColor: primary }}>
      <div className="border-2 border-[#b45309]/40 p-5 md:p-7 relative bg-white">
        
        {/* Heraldic Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-5 border-b-2" style={{ borderColor: primary }}>
          {/* School Emblem / Logo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full text-amber-400 border-2 border-amber-400 flex items-center justify-center shadow-md shrink-0" style={{ backgroundColor: primary }}>
              <School className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight" style={{ color: primary }}>
                {schoolName}
              </h1>
              <p className="text-[11px] font-bold text-amber-800 mt-0.5">
                {affiliateTo} • SCHOOL CODE: {schoolCode}
              </p>
              <p className="text-[10px] text-slate-500">
                {schoolAddress} | Ph: {phone}
              </p>
            </div>
          </div>

          {/* Student Photo */}
          {showStudentPhoto && (
            <div className="flex flex-col items-center shrink-0">
              <div className="w-16 h-20 bg-slate-50 border-2 border-[#065f46] overflow-hidden flex items-center justify-center shadow-xs rounded-sm">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentName)}`}
                  alt={studentName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Candidate</span>
            </div>
          )}
        </div>

        {/* Golden Ribbon Title */}
        <div className="my-4 text-center">
          <div className="inline-block px-8 py-1.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white font-black text-xs md:text-sm tracking-wider uppercase shadow-md border border-amber-300">
            {headingHeader || 'ANNUAL PROGRESS REPORT CARD'}
          </div>
          <div className="text-[11px] font-black text-[#065f46] mt-1.5 uppercase tracking-wide">
            ACADEMIC SESSION: {academicYear} • AFFILIATED TO CBSE
          </div>
        </div>

        {/* Student Profile Grid */}
        <div className="rounded-xl p-4 my-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-emerald-100 bg-emerald-50/40">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Student's Name</span>
            <span className="font-black text-slate-900 text-sm">{studentName}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Roll Number</span>
            <span className="font-mono font-bold text-slate-800">{rollNo}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Admission No.</span>
            <span className="font-mono font-bold text-slate-800">{admissionNo}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Class & Section</span>
            <span className="font-bold text-slate-800">{className} {sectionName ? `(${sectionName})` : ''}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Father's Name</span>
            <span className="font-semibold text-slate-700">{fatherName}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Mother's Name</span>
            <span className="font-semibold text-slate-700">{motherName}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Date of Birth</span>
            <span className="font-semibold text-slate-700">{dob}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Attendance</span>
            <span className="font-semibold text-slate-700">{attendance}</span>
          </div>
        </div>

        {/* Part 1: Scholastic Areas Table */}
        <div className="mb-4">
          <div className="bg-[#065f46] text-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-t-lg">
            PART 1: SCHOLASTIC AREAS
          </div>
          <div className="overflow-x-auto border-x border-b border-emerald-200 rounded-b-lg">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-emerald-900 text-white font-bold text-[10px] uppercase">
                  <th className="px-3.5 py-2">SCHOLASTIC SUBJECTS</th>
                  <th className="px-3.5 py-2 text-center">THEORY (80)</th>
                  <th className="px-3.5 py-2 text-center">PRACTICAL / ASMT (20)</th>
                  <th className="px-3.5 py-2 text-center">TOTAL MARKS (100)</th>
                  <th className="px-3.5 py-2 text-center">PERCENTAGE (%)</th>
                  <th className="px-3.5 py-2 text-center">GRADE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSubjects.map((sub, i) => {
                  const max = Number(sub.maxMarks) || 100
                  const obt = Number(sub.obtainedMarks) || Math.floor(86 + (i * 2) % 12)
                  const prac = sub.practicalColumn ? 18 + (i % 3) : 20
                  const theory = obt - prac
                  const pct = Math.round((obt / max) * 100)
                  const grade = sub.grade || (pct >= 90 ? 'A1' : pct >= 80 ? 'A2' : pct >= 70 ? 'B1' : 'B2')
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="px-3.5 py-2 font-bold text-slate-800">{sub.subjectName}</td>
                      <td className="px-3.5 py-2 text-center font-semibold text-slate-600">{theory}</td>
                      <td className="px-3.5 py-2 text-center font-semibold text-slate-600">{prac}</td>
                      <td className="px-3.5 py-2 text-center font-black text-slate-900">{obt}</td>
                      <td className="px-3.5 py-2 text-center font-mono text-slate-700">{pct}%</td>
                      <td className="px-3.5 py-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {grade}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                <tr className="bg-emerald-50/80 font-black text-xs border-t-2 border-[#065f46]">
                  <td className="px-3.5 py-2.5 text-[#065f46]">TOTAL (Out of {totalMax})</td>
                  <td colSpan={2} className="px-3.5 py-2.5 text-center text-slate-600">OVERALL PERCENTAGE: {percentage}%</td>
                  <td className="px-3.5 py-2.5 text-center text-[#065f46] text-sm font-black">{totalObt}</td>
                  <td className="px-3.5 py-2.5 text-center text-emerald-800">{percentage}%</td>
                  <td className="px-3.5 py-2.5 text-center text-[#065f46]">A1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Part 2: Co-Scholastic & Part 3: Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {/* Co-Scholastic */}
          <div className="border border-emerald-200 rounded-lg overflow-hidden">
            <div className="bg-[#065f46] text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
              PART 2: CO-SCHOLASTIC AREAS (3-POINT SCALE: A, B, C)
            </div>
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-3 py-1.5 font-semibold text-slate-700">Work Education</td><td className="px-3 py-1.5 text-right font-black text-emerald-700">A1</td></tr>
                <tr><td className="px-3 py-1.5 font-semibold text-slate-700">Art Education</td><td className="px-3 py-1.5 text-right font-black text-emerald-700">A1</td></tr>
                <tr><td className="px-3 py-1.5 font-semibold text-slate-700">Health & Physical Education</td><td className="px-3 py-1.5 text-right font-black text-emerald-700">A1</td></tr>
                <tr><td className="px-3 py-1.5 font-semibold text-slate-700">Discipline</td><td className="px-3 py-1.5 text-right font-black text-emerald-700">A</td></tr>
              </tbody>
            </table>
          </div>

          {/* Teacher Remarks */}
          <div className="border border-emerald-200 rounded-lg overflow-hidden p-3.5 bg-emerald-50/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-[#065f46] uppercase tracking-wider block mb-1">
                PART 3: CLASS TEACHER'S REMARKS
              </span>
              <p className="text-xs text-slate-700 italic">
                "{studentName} is a dedicated, hardworking student with excellent academic performance and leadership qualities. Best wishes for the future!"
              </p>
            </div>
            <div className="mt-2 text-[10px] font-black text-emerald-800 uppercase">
              AGGREGATE GRADE: A1 • RESULT: PASSED
            </div>
          </div>
        </div>

        {/* Official Signatures & Seal */}
        <div className="pt-6 mt-4 border-t-2 border-[#065f46] flex flex-col sm:flex-row items-end justify-between gap-6 text-center text-xs" style={{ borderColor: primary }}>
          <div>
            <div className="w-36 border-b border-slate-400 mb-1 pb-1 text-[11px] font-cursive italic text-slate-600">
              Preeti Saxena
            </div>
            <span className="text-[10px] font-black uppercase text-slate-600">Class Teacher</span>
          </div>

          {showHeaderStamp && (
            <div className="flex flex-col items-center select-none">
              <div className="w-16 h-16 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1 text-[7.5px] font-black uppercase text-center shadow-xs" style={{ borderColor: primary, color: primary }}>
                <Award className="w-4 h-4 mb-0.5 text-amber-600" />
                <span>OFFICIAL</span>
                <span>SEAL</span>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-mono">DATE: {new Date().toLocaleDateString('en-GB')}</span>
            </div>
          )}

          <div>
            <div className="w-40 border-b border-slate-400 mb-1 pb-1 text-[11px] font-serif font-black italic text-slate-800">
              {principalName}
            </div>
            <span className="text-[10px] font-black uppercase text-slate-600">Principal</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export interface MarksheetMiniPreviewProps {
  template: 'CBSE Royal Emerald' | 'Minimalist Modern' | 'Dual-Term Consolidated' | 'Holistic Early Skills' | string
  themeColor?: string
  schoolName?: string
  studentName?: string
  className?: string
  rollNo?: string
  examName?: string
  academicYear?: string
  isSelected?: boolean
}

export const MarksheetMiniPreview: React.FC<MarksheetMiniPreviewProps> = ({
  template,
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  studentName = 'Rahul Verma',
  className: studentClass = 'Class 10',
  rollNo = '23',
  examName = 'Annual Exam 2025-26',
  academicYear = '2025-26',
  isSelected = false
}) => {
  const normalized = (template || 'CBSE Royal Emerald').toLowerCase()
  const isMinimalModern = normalized.includes('minimal') || normalized.includes('modern') || normalized.includes('canva')
  const isDualTerm = normalized.includes('dual') || normalized.includes('term') || normalized.includes('icse') || normalized.includes('consolidated') || normalized.includes('maroon') || normalized.includes('scholastic')
  const isHolisticSkills = normalized.includes('holistic') || normalized.includes('skills') || normalized.includes('early') || normalized.includes('kindergarten') || normalized.includes('primary') || normalized.includes('grid') || normalized.includes('indigo')
  
  const defaultBaseColor = isMinimalModern ? '#0f766e' : isDualTerm ? '#660033' : isHolisticSkills ? '#0284c7' : '#065f46'
  const primary = themeColor || defaultBaseColor
  const tintLight = hexToRgba(primary, 0.08)
  const tintMed = hexToRgba(primary, 0.16)
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
      {/* 1. CBSE ROYAL EMERALD MINI PREVIEW */}
      {!isMinimalModern && !isDualTerm && !isHolisticSkills && (
        <div
          className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900"
          style={{ border: `2.5px double ${primary}` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-1" style={{ borderColor: borderTint }}>
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full border flex items-center justify-center text-[5.5px] font-black shrink-0 text-white"
                style={{ backgroundColor: primary, borderColor: '#b45309' }}
              >
                <School className="w-3 h-3 text-amber-300" />
              </div>
              <div>
                <div className="text-[7.5px] font-black leading-tight uppercase truncate max-w-[120px]" style={{ color: primary }}>
                  {schoolName}
                </div>
                <div className="text-[5px] text-amber-800 font-bold leading-none">Affiliated to CBSE • Code: 123456</div>
              </div>
            </div>
            <span className="text-[5px] font-black uppercase px-1 py-0.5 rounded text-white" style={{ backgroundColor: primary }}>
              CBSE BOARD
            </span>
          </div>

          {/* Golden Ribbon Title */}
          <div
            className="w-full text-center py-0.5 rounded text-[5.5px] font-black uppercase text-white shadow-2xs my-0.5"
            style={{ backgroundColor: primary }}
          >
            ANNUAL PROGRESS REPORT CARD • {academicYear}
          </div>

          {/* Student Info & Photo */}
          <div className="flex gap-1.5 items-center my-0.5">
            <div className="flex-1 grid grid-cols-2 gap-x-1 gap-y-0.5 text-[5.5px] bg-slate-50/80 p-1 rounded border" style={{ borderColor: borderTint }}>
              <div><span className="text-slate-400 font-bold">NAME: </span><span className="font-black" style={{ color: primary }}>{studentName}</span></div>
              <div><span className="text-slate-400 font-bold">ROLL: </span><span className="font-black text-slate-900">{rollNo}</span></div>
              <div><span className="text-slate-400 font-bold">CLASS: </span><span className="font-bold text-slate-800">{studentClass}</span></div>
              <div><span className="text-slate-400 font-bold">ATTN: </span><span className="font-bold text-emerald-700">96.4%</span></div>
            </div>

            <div className="w-6 h-7 rounded border flex flex-col items-center justify-center bg-slate-50 shrink-0" style={{ borderColor: primary }}>
              <User className="w-3 h-3 text-slate-400" />
              <span className="text-[3.5px] font-bold text-slate-400 leading-none">PHOTO</span>
            </div>
          </div>

          {/* Mini Scholastic Table */}
          <div className="border rounded overflow-hidden" style={{ borderColor: borderTint }}>
            <div className="flex text-[5px] font-black text-white px-1 py-0.5 justify-between" style={{ backgroundColor: primary }}>
              <span className="w-14">Subject</span>
              <span className="w-8 text-center">Marks</span>
              <span className="w-6 text-right">Grade</span>
            </div>
            <div className="flex text-[5px] font-semibold text-slate-700 px-1 py-0.5 justify-between border-b" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
              <span className="w-14 font-bold text-slate-900">English Comm.</span>
              <span className="w-8 text-center font-mono font-bold">92 / 100</span>
              <span className="w-6 text-right font-black" style={{ color: primary }}>A1</span>
            </div>
            <div className="flex text-[5px] font-semibold text-slate-700 px-1 py-0.5 justify-between">
              <span className="w-14 font-bold text-slate-900">Mathematics</span>
              <span className="w-8 text-center font-mono font-bold">95 / 100</span>
              <span className="w-6 text-right font-black" style={{ color: primary }}>A1</span>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="flex justify-between items-center pt-0.5 text-[4.5px] font-black uppercase text-slate-500 border-t" style={{ borderColor: borderTint }}>
            <span>Class Teacher</span>
            <span className="px-1 py-0.2 rounded border font-serif" style={{ borderColor: primary, color: primary }}>SEAL ★</span>
            <span>Principal Sign</span>
          </div>
        </div>
      )}

      {/* 2. MINIMALIST MODERN MINI PREVIEW */}
      {isMinimalModern && (
        <div className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900 border" style={{ borderColor: primary }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-1" style={{ borderColor: borderTint }}>
            <div>
              <div className="text-[7.5px] font-black uppercase leading-tight truncate max-w-[120px]" style={{ color: primary }}>
                {schoolName}
              </div>
              <div className="text-[5px] text-slate-400 font-semibold">{examName}</div>
            </div>
            <span className="text-[4.5px] font-black uppercase px-1.5 py-0.5 rounded-full text-white shadow-2xs" style={{ backgroundColor: primary }}>
              REPORT CARD
            </span>
          </div>

          {/* KPI Badges & Profile Row */}
          <div className="grid grid-cols-3 gap-1 my-0.5">
            <div className="p-1 rounded border text-center flex flex-col justify-center" style={{ backgroundColor: tintLight, borderColor: borderTint }}>
              <span className="text-[4px] font-bold text-slate-400 uppercase">SCORE</span>
              <span className="text-[8px] font-black leading-none" style={{ color: primary }}>94.2%</span>
            </div>
            <div className="p-1 rounded border text-center flex flex-col justify-center" style={{ backgroundColor: tintLight, borderColor: borderTint }}>
              <span className="text-[4px] font-bold text-slate-400 uppercase">GRADE</span>
              <span className="text-[8px] font-black leading-none text-emerald-600">A+</span>
            </div>
            <div className="p-1 rounded border text-center flex flex-col justify-center" style={{ backgroundColor: tintLight, borderColor: borderTint }}>
              <span className="text-[4px] font-bold text-slate-400 uppercase">ATTEND</span>
              <span className="text-[8px] font-black leading-none text-slate-800">96%</span>
            </div>
          </div>

          {/* Candidate Line */}
          <div className="flex justify-between items-center text-[5.5px] px-1 py-0.5 bg-slate-50 rounded border" style={{ borderColor: borderTint }}>
            <span><strong style={{ color: primary }}>{studentName}</strong> • {studentClass}</span>
            <span className="text-slate-400 font-mono">Roll: #{rollNo}</span>
          </div>

          {/* Progress Bars Mini Table */}
          <div className="space-y-1 my-0.5">
            <div>
              <div className="flex justify-between text-[5px] font-bold text-slate-700">
                <span>English Language</span>
                <span>92%</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '92%', backgroundColor: primary }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[5px] font-bold text-slate-700">
                <span>Mathematics</span>
                <span>96%</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '96%', backgroundColor: primary }} />
              </div>
            </div>
          </div>

          {/* Modern Footer */}
          <div className="flex justify-between items-center text-[4.5px] font-bold text-slate-500 pt-0.5 border-t" style={{ borderColor: borderTint }}>
            <span className="italic">"Outstanding Progress"</span>
            <span style={{ color: primary }} className="font-black">Teacher & Principal Verified ✓</span>
          </div>
        </div>
      )}

      {/* 3. DUAL-TERM CONSOLIDATED MINI PREVIEW */}
      {isDualTerm && (
        <div
          className="w-full h-full p-1.5 flex flex-col justify-between bg-[#fffdfa] text-slate-900 border-2"
          style={{ borderColor: primary }}
        >
          {/* Header */}
          <div className="text-center border-b pb-0.5" style={{ borderColor: borderTint }}>
            <div className="text-[7.5px] font-serif font-black uppercase tracking-wide truncate" style={{ color: primary }}>
              {schoolName}
            </div>
            <div className="text-[5px] text-white font-sans font-black uppercase px-2 py-0.2 rounded-xs inline-block my-0.5" style={{ backgroundColor: primary }}>
              CONSOLIDATED MARK SHEET • TERM I & II
            </div>
          </div>

          {/* Student Info Bar */}
          <div className="flex justify-between items-center text-[5px] px-1 py-0.5 border-y font-sans" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
            <span><strong>{studentName}</strong> ({studentClass})</span>
            <span>Roll: <strong>{rollNo}</strong></span>
            <span className="font-black" style={{ color: primary }}>RANK #3</span>
          </div>

          {/* Dual-Term Comparison Table */}
          <div className="border rounded-xs overflow-hidden text-[4.5px] font-sans" style={{ borderColor: borderTint }}>
            <div className="flex justify-between text-white font-black px-1 py-0.5" style={{ backgroundColor: primary }}>
              <span className="w-16">Subject</span>
              <span className="w-8 text-center">Term I</span>
              <span className="w-8 text-center">Term II</span>
              <span className="w-8 text-right">Total</span>
            </div>
            <div className="flex justify-between px-1 py-0.5 border-b font-medium text-slate-800" style={{ borderColor: borderTint }}>
              <span className="w-16 font-bold truncate">English Core</span>
              <span className="w-8 text-center font-mono">90</span>
              <span className="w-8 text-center font-mono">94</span>
              <span className="w-8 text-right font-black" style={{ color: primary }}>184 / 200</span>
            </div>
            <div className="flex justify-between px-1 py-0.5 font-medium text-slate-800 bg-slate-50/50">
              <span className="w-16 font-bold truncate">Mathematics</span>
              <span className="w-8 text-center font-mono">93</span>
              <span className="w-8 text-center font-mono">95</span>
              <span className="w-8 text-right font-black" style={{ color: primary }}>188 / 200</span>
            </div>
          </div>

          {/* Result Banner & 4 Signatures */}
          <div>
            <div className="text-[5px] font-black uppercase text-center text-white py-0.5 rounded-xs mb-0.5" style={{ backgroundColor: primary }}>
              RESULT: PASSED (1ST DIVISION WITH DISTINCTION)
            </div>
            <div className="flex justify-between text-[4px] font-bold text-slate-500 pt-0.5 border-t" style={{ borderColor: borderTint }}>
              <span>Parent</span>
              <span>Teacher</span>
              <span>In-Charge</span>
              <span>Principal</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. HOLISTIC EARLY SKILLS MINI PREVIEW */}
      {isHolisticSkills && (
        <div
          className="w-full h-full p-1.5 flex flex-col justify-between bg-gradient-to-b from-sky-50/80 via-white to-amber-50/60 text-slate-800 rounded-lg border-2"
          style={{ borderColor: primary }}
        >
          {/* Header */}
          <div className="text-center border-b pb-0.5" style={{ borderColor: borderTint }}>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
              <span className="text-[7.5px] font-black uppercase tracking-tight" style={{ color: primary }}>
                {schoolName}
              </span>
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
            </div>
            <div className="text-[5px] font-bold text-slate-500 uppercase">
              HOLISTIC SKILLS & DEVELOPMENT PROGRESS
            </div>
          </div>

          {/* Child Ribbon */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-dashed shadow-2xs" style={{ borderColor: borderTint }}>
            <div className="w-5 h-5 rounded-full border flex items-center justify-center bg-amber-50 shrink-0" style={{ borderColor: primary }}>
              <User className="w-3 h-3 text-slate-500" />
            </div>
            <div className="flex-1 text-[5.5px] leading-tight">
              <div className="font-black" style={{ color: primary }}>{studentName}</div>
              <div className="text-slate-500 font-semibold">{studentClass} • Kindergarten Section</div>
            </div>
            <span className="text-[4.5px] font-black uppercase px-1 py-0.5 rounded bg-emerald-100 text-emerald-800">
              EXCELLING ★
            </span>
          </div>

          {/* 4 Domains Assessment */}
          <div className="grid grid-cols-2 gap-1 text-[5px]">
            <div className="p-0.5 rounded bg-white border flex justify-between items-center" style={{ borderColor: borderTint }}>
              <span className="font-bold text-slate-700 truncate">Cognitive & Logic</span>
              <span className="text-amber-500 font-bold shrink-0">★★★★★</span>
            </div>
            <div className="p-0.5 rounded bg-white border flex justify-between items-center" style={{ borderColor: borderTint }}>
              <span className="font-bold text-slate-700 truncate">Language & Literacy</span>
              <span className="text-amber-500 font-bold shrink-0">★★★★★</span>
            </div>
            <div className="p-0.5 rounded bg-white border flex justify-between items-center" style={{ borderColor: borderTint }}>
              <span className="font-bold text-slate-700 truncate">Creative Expression</span>
              <span className="text-amber-500 font-bold shrink-0">★★★★☆</span>
            </div>
            <div className="p-0.5 rounded bg-white border flex justify-between items-center" style={{ borderColor: borderTint }}>
              <span className="font-bold text-slate-700 truncate">Social & Emotional</span>
              <span className="text-amber-500 font-bold shrink-0">★★★★★</span>
            </div>
          </div>

          {/* Teacher Smiley Footer */}
          <div className="flex justify-between items-center text-[4.5px] font-bold text-slate-600 pt-0.5 border-t" style={{ borderColor: borderTint }}>
            <span className="text-amber-600">🌟 Teacher: "Inquisitive & joyful learner!"</span>
            <span className="font-black" style={{ color: primary }}>Class Teacher & Principal</span>
          </div>
        </div>
      )}
    </div>
  )
}


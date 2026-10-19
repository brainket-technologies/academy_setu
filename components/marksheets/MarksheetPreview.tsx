'use client'

import React, { useState, useEffect } from 'react'
import { Award, CheckCircle2, ShieldCheck, QrCode, Sparkles, School, Star, BookOpen, Heart, Activity, Palette, Compass, Trophy, User, Check } from 'lucide-react'
import { LiveEditableText, ProperQrCode, SampleSchoolLogo } from '@/components/admit-card/AdmitCardModalPreview'

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
  schoolLogo?: string
  logoWidth?: string | number
  logoHeight?: string | number
  showLogo?: boolean
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
  editable?: boolean
  customLabels?: Record<string, string>
  onUpdateField?: (field: string, value: any) => void
}

export const MarksheetPreview: React.FC<MarksheetPreviewProps> = ({
  templateName = 'CBSE Royal Emerald',
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  affiliateTo = 'Affiliated to CBSE, New Delhi • Affiliation No. 2130842',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi - 110092',
  schoolCode = '123456',
  schoolLogo,
  logoWidth = 60,
  logoHeight,
  showLogo: showLogoProp,
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
  },
  editable = false,
  customLabels = {},
  onUpdateField
}) => {
  // Default primary labels for all marksheet templates
  const defaultLabels: Record<string, string> = {
    // Student Info Labels
    studentNameLabel: "Student's Name",
    rollNoLabel: "Roll Number",
    admissionNoLabel: "Admission No.",
    classSectionLabel: "Class & Section",
    fatherNameLabel: "Father's Name",
    motherNameLabel: "Mother's Name",
    dobLabel: "Date of Birth",
    attendanceLabel: "Attendance",

    // Template 1 (CBSE Royal) Labels
    candidatePhotoLabel: "Candidate",
    sessionTitle: "ACADEMIC SESSION:",
    affilCbseTitle: "AFFILIATED TO CBSE",
    part1Heading: "PART 1: SCHOLASTIC AREAS",
    thSubjects: "SCHOLASTIC SUBJECTS",
    thTheory: "THEORY (80)",
    thPractical: "PRACTICAL / ASMT (20)",
    thTotal: "TOTAL MARKS (100)",
    thPct: "PERCENTAGE (%)",
    thGrade: "GRADE",
    totalLabel: "TOTAL",
    overallPctLabel: "OVERALL PERCENTAGE:",
    part2Heading: "PART 2: CO-SCHOLASTIC AREAS (3-POINT SCALE: A, B, C)",
    part3Heading: "PART 3: CLASS TEACHER'S REMARKS",
    aggregateGradeLabel: "AGGREGATE GRADE: A1 • RESULT: PASSED",
    officialSealLabel: "OFFICIAL SEAL",

    // Signatures
    teacherSignLabel: "Class Teacher",
    principalSignLabel: "Principal",
    parentSignLabel: "Parent / Guardian",
    examInChargeSignLabel: "Exam In-Charge",

    // QR Verification
    qrCodeText: "CODE: MS-2025-042",
    qrVerifyLabel: "Official Marksheet QR",

    // Template 2 (Minimalist Modern)
    profileTitle: "Student Profile",
    attendanceIndicator: "Attendance Indicator",
    attendanceOnTrack: "✓ On Track",
    academicPerformanceHeading: "Modern Academic Performance",
    totalScoreLabel: "Total Score",
    overallRemarksHeading: "Overall Remarks",
    percentageBadge: "PERCENTAGE:",
    cgpaBadge: "CGPA:",
    gradeBadge: "GRADE: A+",

    // Template 3 (Dual-Term Consolidated)
    consolidatedHeading: "CONSOLIDATED ACADEMIC PERFORMANCE (TERM I & TERM II)",
    thSubject: "SUBJECT",
    term1Heading: "TERM I",
    term2Heading: "TERM II",
    grandTotalHeading: "GRAND TOTAL",
    pt1Heading: "PT 1 (20)",
    halfYearlyHeading: "Half Yearly (80)",
    subtotalHeading: "Subtotal",
    gradeHeading: "Grade",
    pt2Heading: "PT 2 (20)",
    annualHeading: "Annual (80)",
    classRankLabel: "CLASS RANK",
    outOfClassLabel: "out of 45",
    resultPassedBanner: "RESULT: PASSED (DIVISION 1ST WITH DISTINCTION)",
    coScholasticAssessmentLabel: "CO-SCHOLASTIC ASSESSMENT",
    coScholasticValLabel: "Grade A (Exemplary)",
    gradeScaleHeading: "GRADE POINT SCALE",

    // Template 4 (Holistic Early Skills)
    holisticHeading: "HOLISTIC SKILLS & DEVELOPMENTAL PROGRESS REPORT",
    domain1Heading: "1. Language & Literacy",
    domain2Heading: "2. Numeracy & Logic",
    domain3Heading: "3. Creative Expression & Arts",
    domain4Heading: "4. Social Habits & Motor Skills",
    teacherRemarksTitle: "Teacher's Encouraging Remarks",
    wayToGoLabel: "WAY TO GO!"
  }

  const [labels, setLabels] = useState<Record<string, string>>({
    ...defaultLabels,
    ...(customLabels || {})
  })

  useEffect(() => {
    setLabels(prev => ({ ...prev, ...(customLabels || {}) }))
  }, [customLabels])

  const updateLabel = (key: string, val: string) => {
    const updated = { ...labels, [key]: val }
    setLabels(updated)
    onUpdateField?.('customLabels', updated)
  }

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

  // Dynamic logo calculation with sample fallback
  const showLogo = showLogoProp !== undefined 
    ? showLogoProp 
    : (columnsList ? (columnsList as any).logo !== false : true)
  const actualLogoWidth = Math.max(28, Math.min(180, Number(logoWidth) || 60))

  // =========================================================================
  // TEMPLATE 2: MINIMALIST MODERN (CANVA / PINTEREST STYLE - TEAL & SLATE)
  // =========================================================================
  if (isMinimalModern) {
    return (
      <div className="w-full max-w-[780px] bg-white text-slate-800 rounded-3xl shadow-2xl p-7 md:p-9 font-sans border select-none" style={{ borderColor: borderTint }}>
        {/* Header */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
          {showLogo && (
            <div 
              className="mb-2.5 shrink-0 flex items-center justify-center overflow-hidden"
              style={{ width: `${actualLogoWidth}px`, height: `${actualLogoWidth}px` }}
            >
              {schoolLogo ? (
                <img
                  src={schoolLogo}
                  alt={schoolName || 'School Logo'}
                  className="w-full h-full object-contain"
                />
              ) : (
                <SampleSchoolLogo width={actualLogoWidth} height={actualLogoWidth} color={primary} />
              )}
            </div>
          )}
          <div className="flex items-center gap-2.5 font-black text-lg md:text-xl tracking-tight uppercase" style={{ color: primary }}>
            {!showLogo && <School className="w-7 h-7" style={{ color: primary }} />}
            <LiveEditableText
              tag="span"
              value={schoolName}
              editable={editable}
              onSave={val => onUpdateField?.('schoolName', val)}
              className="inline-block"
            />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            <LiveEditableText
              value={headingHeader || 'STUDENT REPORT CARD'}
              editable={editable}
              onSave={val => onUpdateField?.('headingHeader', val)}
              className="inline-block"
            /> • {labels.academicYearTitle || 'ACADEMIC YEAR'}{' '}
            <LiveEditableText
              value={academicYear}
              editable={editable}
              onSave={val => onUpdateField?.('academicYear', val)}
              className="inline-block"
            />
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">
            <LiveEditableText
              value={affiliateTo}
              editable={editable}
              onSave={val => onUpdateField?.('affiliateTo', val)}
              className="inline-block"
            />
          </p>
        </div>

        {/* Student Profile, Proper QR & Attendance Gauge Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-6">
          {/* Profile Card */}
          <div className="sm:col-span-2 bg-slate-50 border rounded-2xl p-4 flex items-center gap-4" style={{ borderColor: borderTint }}>
            {showStudentPhoto && (
              <div 
                className="w-16 h-16 rounded-full border-2 overflow-hidden shrink-0 shadow-sm flex items-center justify-center"
                style={{ backgroundColor: tintLight, borderColor: primary }}
              >
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentName)}`}
                  alt={studentName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: primary }}>
                <LiveEditableText
                  value={labels.profileTitle || 'Student Profile'}
                  editable={editable}
                  onSave={val => updateLabel('profileTitle', val)}
                  className="inline-block"
                />
              </span>
              <h3 className="text-base font-black text-slate-900 leading-tight">{studentName}</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-600 mt-1">
                {columnsList.classSection !== false && (
                  <span>Class: <strong className="text-slate-900">{className} {sectionName ? `(${sectionName})` : ''}</strong></span>
                )}
                {columnsList.rollNumber !== false && (
                  <span>Roll: <strong className="text-slate-900">{rollNo}</strong></span>
                )}
                {columnsList.admissionNo !== false && (
                  <span>ID: <strong className="text-slate-900">{admissionNo}</strong></span>
                )}
                {columnsList.dob && (
                  <span>DOB: <strong className="text-slate-900">{dob}</strong></span>
                )}
                {columnsList.gender && (
                  <span>Gender: <strong className="text-slate-900">Male</strong></span>
                )}
                {columnsList.mobileNumber && (
                  <span>Mobile: <strong className="text-slate-900">9876543210</strong></span>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Indicator Card */}
          {columnsList.attendance !== false && (
            <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col items-center justify-center text-center" style={{ borderColor: borderTint }}>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <LiveEditableText
                  value={labels.attendanceIndicator || 'Attendance Indicator'}
                  editable={editable}
                  onSave={val => updateLabel('attendanceIndicator', val)}
                  className="inline-block"
                />
              </span>
              <div className="text-xl font-black mt-1" style={{ color: primary }}>96%</div>
              <span className="text-[10px] font-semibold text-slate-500">175 / 182 Days</span>
              <span 
                className="mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border"
                style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}
              >
                <LiveEditableText
                  value={labels.attendanceOnTrack || '✓ On Track'}
                  editable={editable}
                  onSave={val => updateLabel('attendanceOnTrack', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}

          {/* Proper QR Code Verification Card */}
          <div className="bg-slate-50 border rounded-2xl p-2.5 flex flex-col items-center justify-center text-center" style={{ borderColor: borderTint }}>
            <ProperQrCode className="w-18 h-18" color={primary} />
            <span className="text-[7.5px] font-black uppercase tracking-wider mt-1" style={{ color: primary }}>
              <LiveEditableText
                value={labels.qrVerifyLabel || 'Official Marksheet QR'}
                editable={editable}
                onSave={val => updateLabel('qrVerifyLabel', val)}
                className="inline-block"
              />
            </span>
            <LiveEditableText
              value={labels.qrCodeText || 'CODE: MS-2025-042'}
              editable={editable}
              onSave={val => updateLabel('qrCodeText', val)}
              className="text-[7px] font-mono font-bold text-slate-400 mt-0.5 inline-block"
            />
          </div>
        </div>

        {/* Modern Academic Performance Table with Progress Bars */}
        <div className="border rounded-2xl overflow-hidden shadow-xs mb-6" style={{ borderColor: borderTint }}>
          <div className="text-white px-5 py-3 flex items-center justify-between text-xs font-black uppercase tracking-wider" style={{ backgroundColor: primary }}>
            <LiveEditableText
              value={labels.academicPerformanceHeading || 'Modern Academic Performance'}
              editable={editable}
              onSave={val => updateLabel('academicPerformanceHeading', val)}
              className="inline-block"
            />
            <span className="text-white/90 font-semibold text-[11px]">
              <LiveEditableText
                value={examName}
                editable={editable}
                onSave={val => onUpdateField?.('examName', val)}
                className="inline-block"
              />
            </span>
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
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border"
                      style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}
                    >
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
                      <span 
                        className="px-2 py-0.5 rounded-md text-[10px] font-black border ml-1"
                        style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}
                      >
                        {grade}
                      </span>
                    </div>

                    {/* Sleek Progress Bar */}
                    <div className="flex items-center gap-2.5 flex-1 max-w-[200px]">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: primary }}
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
        <div className="bg-slate-50 border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 mb-6" style={{ borderColor: borderTint }}>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black text-white shadow-xs" style={{ backgroundColor: primary }}>
              <LiveEditableText
                value={labels.percentageBadge || 'PERCENTAGE:'}
                editable={editable}
                onSave={val => updateLabel('percentageBadge', val)}
                className="inline-block mr-1"
              />
              {percentage}%
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-800 text-white shadow-xs">
              <LiveEditableText
                value={labels.cgpaBadge || 'CGPA:'}
                editable={editable}
                onSave={val => updateLabel('cgpaBadge', val)}
                className="inline-block mr-1"
              />
              {((Number(percentage) / 100) * 4).toFixed(1)} / 4.0
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black text-white shadow-xs" style={{ backgroundColor: primary, opacity: 0.9 }}>
              <LiveEditableText
                value={labels.gradeBadge || 'GRADE: A+'}
                editable={editable}
                onSave={val => updateLabel('gradeBadge', val)}
                className="inline-block"
              />
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              <LiveEditableText
                value={labels.totalScoreLabel || 'Total Score'}
                editable={editable}
                onSave={val => updateLabel('totalScoreLabel', val)}
                className="inline-block"
              />
            </span>
            <span className="text-sm font-black text-slate-900">{totalObt} / {totalMax}</span>
          </div>
        </div>

        {/* Overall Remarks */}
        {columnsList.remarks !== false && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              <LiveEditableText
                value={labels.overallRemarksHeading || 'Overall Remarks'}
                editable={editable}
                onSave={val => updateLabel('overallRemarksHeading', val)}
                className="inline-block"
              />
            </span>
            <p className="text-xs font-medium text-slate-700 italic">
              <LiveEditableText
                tag="span"
                multiline
                value={labels.remarksText || '"Rahul is a dedicated, hardworking student with excellent academic performance and leadership qualities. Best wishes for continued success!"'}
                editable={editable}
                onSave={val => updateLabel('remarksText', val)}
                className="inline-block"
              />
            </p>
          </div>
        )}

        {/* Signatures */}
        <div className="flex flex-wrap items-center justify-around gap-6 pt-4 border-t border-slate-100 text-center">
          {columnsList.principalSign !== false && (
            <div className="flex flex-col items-center">
              <div className="h-9 flex items-end justify-center font-serif italic text-slate-700 text-sm font-bold border-b border-slate-300 w-40 pb-1">
                {principalName}
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 mt-1">
                <LiveEditableText
                  value={labels.principalSignLabel || "Principal's Signature"}
                  editable={editable}
                  onSave={val => updateLabel('principalSignLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}
          {columnsList.teacherSign !== false && (
            <div className="flex flex-col items-center">
              <div className="h-9 flex items-end justify-center font-cursive italic text-slate-700 text-sm font-bold border-b border-slate-300 w-40 pb-1">
                Preeti Saxena
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 mt-1">
                <LiveEditableText
                  value={labels.teacherSignLabel || "Class Teacher's Signature"}
                  editable={editable}
                  onSave={val => updateLabel('teacherSignLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}
          {columnsList.controllerSign !== false && (
            <div className="flex flex-col items-center">
              <div className="h-9 flex items-end justify-center font-serif italic text-slate-700 text-sm font-bold border-b border-slate-300 w-40 pb-1">
                Exam In-Charge
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 mt-1">
                <LiveEditableText
                  value={labels.examInChargeSignLabel || "Exam Controller"}
                  editable={editable}
                  onSave={val => updateLabel('examInChargeSignLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}
          {columnsList.parentSign && (
            <div className="flex flex-col items-center">
              <div className="h-9 flex items-end justify-center font-serif italic text-slate-700 text-sm font-bold border-b border-slate-300 w-40 pb-1">
                Parent Signature
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 mt-1">
                <LiveEditableText
                  value={labels.parentSignLabel || "Parent / Guardian"}
                  editable={editable}
                  onSave={val => updateLabel('parentSignLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // =========================================================================
  // TEMPLATE 3: DUAL-TERM CONSOLIDATED (ICSE & STATE BOARD COMPARATIVE FORMAT)
  // =========================================================================
  if (isDualTerm) {
    return (
      <div className="w-full max-w-[800px] bg-white text-slate-900 shadow-2xl p-7 md:p-9 font-serif border-[10px] select-none" style={{ borderColor: primary }}>
        <div className="border-2 p-5 md:p-7 bg-[#fffdf9]" style={{ borderColor: borderTint }}>
          
          {/* Header */}
          <div className="text-center pb-4 border-b-2" style={{ borderColor: primary }}>
            <div className="flex items-center justify-center gap-3">
              {showLogo && (
                <div 
                  className="shrink-0 flex items-center justify-center overflow-hidden rounded-full border-2 shadow-xs p-1"
                  style={{ 
                    width: `${actualLogoWidth}px`, 
                    height: `${actualLogoWidth}px`,
                    backgroundColor: schoolLogo ? 'transparent' : primary,
                    borderColor: borderTint
                  }}
                >
                  {schoolLogo ? (
                    <img
                      src={schoolLogo}
                      alt={schoolName || 'School Logo'}
                      className="w-full h-full object-contain rounded-full"
                    />
                  ) : (
                    <SampleSchoolLogo width={actualLogoWidth - 8} height={actualLogoWidth - 8} color="#ffffff" />
                  )}
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide" style={{ color: primary }}>
                <LiveEditableText
                  tag="span"
                  value={schoolName}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolName', val)}
                  className="inline-block"
                />
              </h1>
            </div>
            <p className="text-xs font-bold text-slate-600 tracking-wider uppercase mt-1">
              <LiveEditableText
                value={affiliateTo}
                editable={editable}
                onSave={val => onUpdateField?.('affiliateTo', val)}
                className="inline-block"
              /> • {labels.schoolCodeLabel || 'SCHOOL CODE:'}{' '}
              <LiveEditableText
                value={schoolCode}
                editable={editable}
                onSave={val => onUpdateField?.('schoolCode', val)}
                className="inline-block"
              />
            </p>
            <div 
              className="inline-block mt-2 px-6 py-1 text-white font-sans font-black text-xs uppercase tracking-widest rounded-sm shadow-xs"
              style={{ backgroundColor: primary }}
            >
              <LiveEditableText
                value={headingHeader || 'ANNUAL ACADEMIC MARK SHEET'}
                editable={editable}
                onSave={val => onUpdateField?.('headingHeader', val)}
                className="inline-block mr-1"
              />{' '}
              <LiveEditableText
                value={academicYear}
                editable={editable}
                onSave={val => onUpdateField?.('academicYear', val)}
                className="inline-block"
              />
            </div>
          </div>

          {/* Student Profile Info Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3.5 border-b text-xs font-sans" style={{ borderColor: borderTint }}>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[9px] block">
                <LiveEditableText
                  value={labels.studentNameLabel || 'Student Name:'}
                  editable={editable}
                  onSave={val => updateLabel('studentNameLabel', val)}
                  className="inline-block"
                />
              </span>
              <strong className="text-slate-900">{studentName}</strong>
            </div>
            {columnsList.classSection !== false && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">
                  <LiveEditableText
                    value={labels.classSectionLabel || 'Class / Sec:'}
                    editable={editable}
                    onSave={val => updateLabel('classSectionLabel', val)}
                    className="inline-block"
                  />
                </span>
                <strong className="text-slate-900">{className} {sectionName ? `(${sectionName})` : ''}</strong>
              </div>
            )}
            {columnsList.rollNumber !== false && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">
                  <LiveEditableText
                    value={labels.rollNoLabel || 'Roll No:'}
                    editable={editable}
                    onSave={val => updateLabel('rollNoLabel', val)}
                    className="inline-block"
                  />
                </span>
                <strong className="text-slate-900">{rollNo}</strong>
              </div>
            )}
            {columnsList.admissionNo !== false && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">
                  <LiveEditableText
                    value={labels.admissionNoLabel || 'Admin No:'}
                    editable={editable}
                    onSave={val => updateLabel('admissionNoLabel', val)}
                    className="inline-block"
                  />
                </span>
                <strong className="text-slate-900">{admissionNo}</strong>
              </div>
            )}
            {columnsList.dob && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">DOB:</span>
                <strong className="text-slate-900">{dob}</strong>
              </div>
            )}
            {columnsList.fatherName && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Father:</span>
                <strong className="text-slate-900">{fatherName}</strong>
              </div>
            )}
            {columnsList.mobileNumber && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Mobile:</span>
                <strong className="text-slate-900">9876543210</strong>
              </div>
            )}
          </div>

          {/* Dual-Term Consolidated Table */}
          <div className="my-4 overflow-x-auto border-2 rounded-sm" style={{ borderColor: primary }}>
            <div 
              className="text-white text-center py-1.5 font-sans font-black text-xs uppercase tracking-wider"
              style={{ backgroundColor: primary }}
            >
              <LiveEditableText
                value={labels.consolidatedHeading || 'CONSOLIDATED ACADEMIC PERFORMANCE (TERM I & TERM II)'}
                editable={editable}
                onSave={val => updateLabel('consolidatedHeading', val)}
                className="inline-block"
              />
            </div>
            <table className="w-full text-[11px] text-center font-sans border-collapse">
              <thead>
                <tr className="text-white font-bold text-[10px]" style={{ backgroundColor: primary, opacity: 0.95 }}>
                  <th rowSpan={2} className="p-2 border-r border-white/20 text-left pl-3">
                    <LiveEditableText value={labels.thSubject || 'SUBJECT'} editable={editable} onSave={val => updateLabel('thSubject', val)} />
                  </th>
                  <th colSpan={4} className="p-1 border-r border-white/20">
                    <LiveEditableText value={labels.term1Heading || 'TERM I'} editable={editable} onSave={val => updateLabel('term1Heading', val)} />
                  </th>
                  <th colSpan={4} className="p-1 border-r border-white/20">
                    <LiveEditableText value={labels.term2Heading || 'TERM II'} editable={editable} onSave={val => updateLabel('term2Heading', val)} />
                  </th>
                  <th rowSpan={2} className="p-2">
                    <LiveEditableText value={labels.grandTotalHeading || 'GRAND TOTAL'} editable={editable} onSave={val => updateLabel('grandTotalHeading', val)} />
                  </th>
                </tr>
                <tr className="text-white font-semibold text-[9px]" style={{ backgroundColor: primary, opacity: 0.85 }}>
                  <th className="p-1 border-r border-white/20">
                    <LiveEditableText value={labels.pt1Heading || 'PT 1 (20)'} editable={editable} onSave={val => updateLabel('pt1Heading', val)} />
                  </th>
                  <th className="p-1 border-r border-white/20">
                    <LiveEditableText value={labels.halfYearlyHeading || 'Half Yearly (80)'} editable={editable} onSave={val => updateLabel('halfYearlyHeading', val)} />
                  </th>
                  <th className="p-1 border-r border-white/20">
                    <LiveEditableText value={labels.subtotalHeading || 'Subtotal'} editable={editable} onSave={val => updateLabel('subtotalHeading', val)} />
                  </th>
                  <th className="p-1 border-r border-white/20">
                    <LiveEditableText value={labels.gradeHeading || 'Grade'} editable={editable} onSave={val => updateLabel('gradeHeading', val)} />
                  </th>
                  <th className="p-1 border-r border-white/20">
                    <LiveEditableText value={labels.pt2Heading || 'PT 2 (20)'} editable={editable} onSave={val => updateLabel('pt2Heading', val)} />
                  </th>
                  <th className="p-1 border-r border-white/20">
                    <LiveEditableText value={labels.annualHeading || 'Annual (80)'} editable={editable} onSave={val => updateLabel('annualHeading', val)} />
                  </th>
                  <th className="p-1 border-r border-white/20">
                    <LiveEditableText value={labels.subtotalHeading || 'Subtotal'} editable={editable} onSave={val => updateLabel('subtotalHeading', val)} />
                  </th>
                  <th className="p-1 border-r border-white/20">
                    <LiveEditableText value={labels.gradeHeading || 'Grade'} editable={editable} onSave={val => updateLabel('gradeHeading', val)} />
                  </th>
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
                      <td className="p-1 border-r border-slate-200 font-bold" style={{ color: primary }}>A1</td>
                      <td className="p-1 border-r border-slate-200 text-slate-600">{pt2}</td>
                      <td className="p-1 border-r border-slate-200 text-slate-600">{ann}</td>
                      <td className="p-1 border-r border-slate-200 font-bold text-slate-900">{t2}</td>
                      <td className="p-1 border-r border-slate-200 font-bold" style={{ color: primary }}>A1</td>
                      <td className="p-1 font-black text-slate-900">{grandTotal} / 200</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Class Rank Badge, Proper QR & Result Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-4 my-4 font-sans">
            {/* Class Rank */}
            {columnsList.rank !== false && (
              <div 
                className="w-26 h-28 rounded-2xl text-white p-2 flex flex-col items-center justify-center text-center shadow-md shrink-0"
                style={{ backgroundColor: primary }}
              >
                <span className="text-[7.5px] font-black uppercase tracking-wider">
                  <LiveEditableText
                    value={labels.classRankLabel || 'CLASS RANK'}
                    editable={editable}
                    onSave={val => updateLabel('classRankLabel', val)}
                    className="inline-block"
                  />
                </span>
                <span className="text-3xl font-black my-0.5">3</span>
                <span className="text-[8.5px] opacity-80">
                  <LiveEditableText
                    value={labels.outOfClassLabel || 'out of 45'}
                    editable={editable}
                    onSave={val => updateLabel('outOfClassLabel', val)}
                    className="inline-block"
                  />
                </span>
              </div>
            )}

            {/* Proper QR Code */}
            <div className="w-24 h-28 rounded-2xl bg-white border p-2 flex flex-col items-center justify-between text-center shadow-xs shrink-0" style={{ borderColor: borderTint }}>
              <span className="text-[7px] font-black uppercase tracking-wider" style={{ color: primary }}>
                <LiveEditableText
                  value={labels.qrVerifyLabel || 'Official Marksheet QR'}
                  editable={editable}
                  onSave={val => updateLabel('qrVerifyLabel', val)}
                  className="inline-block"
                />
              </span>
              <ProperQrCode className="w-16 h-16" color={primary} />
              <LiveEditableText
                value={labels.qrCodeText || 'CODE: MS-2025-042'}
                editable={editable}
                onSave={val => updateLabel('qrCodeText', val)}
                className="text-[6.5px] font-mono font-bold text-slate-500 inline-block"
              />
            </div>

            {/* Result & Assessment Banner */}
            <div className="flex-1 w-full space-y-2">
              {columnsList.result !== false && (
                <div 
                  className="text-white p-3 text-center font-black text-sm uppercase tracking-wider rounded-sm shadow-xs"
                  style={{ backgroundColor: primary }}
                >
                  <LiveEditableText
                    value={labels.resultPassedBanner || 'RESULT: PASSED (DIVISION 1ST WITH DISTINCTION)'}
                    editable={editable}
                    onSave={val => updateLabel('resultPassedBanner', val)}
                    className="inline-block"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                {columnsList.remarks !== false && (
                  <div className="border p-2 rounded-sm" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
                    <span className="text-[9px] font-bold uppercase block" style={{ color: primary }}>
                      <LiveEditableText
                        value={labels.coScholasticAssessmentLabel || 'CO-SCHOLASTIC ASSESSMENT'}
                        editable={editable}
                        onSave={val => updateLabel('coScholasticAssessmentLabel', val)}
                        className="inline-block"
                      />
                    </span>
                    <span className="font-bold text-slate-800">
                      <LiveEditableText
                        value={labels.coScholasticValLabel || 'Grade A (Exemplary)'}
                        editable={editable}
                        onSave={val => updateLabel('coScholasticValLabel', val)}
                        className="inline-block"
                      />
                    </span>
                  </div>
                )}
                {columnsList.attendance !== false && (
                  <div className="border p-2 rounded-sm" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
                    <span className="text-[9px] font-bold uppercase block" style={{ color: primary }}>
                      <LiveEditableText
                        value={labels.attendanceLabel || 'ATTENDANCE'}
                        editable={editable}
                        onSave={val => updateLabel('attendanceLabel', val)}
                        className="inline-block"
                      />
                    </span>
                    <span className="font-bold text-slate-800">218 / 225 Days (96.8%)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grade Point Scale */}
          <div className="border rounded-sm overflow-hidden text-[9px] text-center font-sans my-4" style={{ borderColor: borderTint }}>
            <div className="text-white font-bold py-1 uppercase tracking-wider" style={{ backgroundColor: primary }}>
              <LiveEditableText
                value={labels.gradeScaleHeading || 'GRADE POINT SCALE'}
                editable={editable}
                onSave={val => updateLabel('gradeScaleHeading', val)}
                className="inline-block"
              />
            </div>
            <div className="grid grid-cols-8 divide-x divide-slate-200 bg-white py-1 font-semibold">
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
          <div className="flex flex-wrap items-center justify-around gap-4 pt-6 border-t-2 text-center font-sans text-[10px]" style={{ borderColor: primary }}>
            {columnsList.principalSign !== false && (
              <div className="min-w-[110px]">
                <div className="h-8 border-b border-slate-400 font-serif italic font-bold">{principalName}</div>
                <span className="font-black uppercase text-slate-600 block mt-1">
                  <LiveEditableText
                    value={labels.principalSignLabel || 'Principal'}
                    editable={editable}
                    onSave={val => updateLabel('principalSignLabel', val)}
                    className="inline-block"
                  />
                </span>
              </div>
            )}
            {columnsList.controllerSign !== false && (
              <div className="min-w-[110px]">
                <div className="h-8 border-b border-slate-400 font-serif italic">Exam Board</div>
                <span className="font-black uppercase text-slate-600 block mt-1">
                  <LiveEditableText
                    value={labels.examInChargeSignLabel || 'Exam In-Charge'}
                    editable={editable}
                    onSave={val => updateLabel('examInChargeSignLabel', val)}
                    className="inline-block"
                  />
                </span>
              </div>
            )}
            {columnsList.teacherSign !== false && (
              <div className="min-w-[110px]">
                <div className="h-8 border-b border-slate-400 font-serif italic">Preeti Saxena</div>
                <span className="font-black uppercase text-slate-600 block mt-1">
                  <LiveEditableText
                    value={labels.teacherSignLabel || 'Class Teacher'}
                    editable={editable}
                    onSave={val => updateLabel('teacherSignLabel', val)}
                    className="inline-block"
                  />
                </span>
              </div>
            )}
            {columnsList.parentSign !== false && (
              <div className="min-w-[110px]">
                <div className="h-8 border-b border-slate-400 font-serif italic">Guardian Sign</div>
                <span className="font-black uppercase text-slate-600 block mt-1">
                  <LiveEditableText
                    value={labels.parentSignLabel || 'Parent / Guardian'}
                    editable={editable}
                    onSave={val => updateLabel('parentSignLabel', val)}
                    className="inline-block"
                  />
                </span>
              </div>
            )}
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
      <div className="w-full max-w-[800px] bg-white text-slate-800 rounded-3xl shadow-2xl p-7 md:p-9 font-sans border-4 select-none" style={{ borderColor: borderTint }}>
        
        {/* Playful Header */}
        <div className="text-center pb-5 border-b-2" style={{ borderColor: borderTint }}>
          {showLogo && (
            <div 
              className="mx-auto mb-2.5 shrink-0 flex items-center justify-center overflow-hidden"
              style={{ width: `${actualLogoWidth}px`, height: `${actualLogoWidth}px` }}
            >
              {schoolLogo ? (
                <img
                  src={schoolLogo}
                  alt={schoolName || 'School Logo'}
                  className="w-full h-full object-contain"
                />
              ) : (
                <SampleSchoolLogo width={actualLogoWidth} height={actualLogoWidth} color={primary} />
              )}
            </div>
          )}
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs mb-2 border"
            style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}
          >
            <Star className="w-4 h-4" style={{ fill: primary, color: primary }} />
            <span>
              {labels.academicYearTitle || 'ACADEMIC YEAR'}{' '}
              <LiveEditableText
                value={academicYear}
                editable={editable}
                onSave={val => onUpdateField?.('academicYear', val)}
                className="inline-block"
              />
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight" style={{ color: primary }}>
            <LiveEditableText
              tag="span"
              value={labels.holisticHeading || 'HOLISTIC SKILLS & DEVELOPMENTAL PROGRESS REPORT'}
              editable={editable}
              onSave={val => updateLabel('holisticHeading', val)}
              className="inline-block"
            />
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            <LiveEditableText
              value={schoolName}
              editable={editable}
              onSave={val => onUpdateField?.('schoolName', val)}
              className="inline-block"
            /> • Primary & Kindergarten Section
          </p>
        </div>

        {/* Child Profile Ribbon & Proper QR Code */}
        <div className="bg-white border-2 border-dashed rounded-2xl p-4 my-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs" style={{ borderColor: borderTint }}>
          <div className="flex items-center gap-4">
            {showStudentPhoto && (
              <div 
                className="w-18 h-18 rounded-full border-4 overflow-hidden shadow-md shrink-0 flex items-center justify-center bg-slate-50"
                style={{ borderColor: primary }}
              >
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentName + 'kid')}`}
                  alt={studentName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: primary }}>
                <LiveEditableText
                  value={labels.childNameLabel || "Child's Name"}
                  editable={editable}
                  onSave={val => updateLabel('childNameLabel', val)}
                  className="inline-block"
                />
              </span>
              <h3 className="text-xl font-black text-slate-900">{studentName}</h3>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600 mt-0.5">
                <span>
                  <LiveEditableText
                    value={labels.classLabel || 'Class:'}
                    editable={editable}
                    onSave={val => updateLabel('classLabel', val)}
                    className="inline-block mr-1"
                  />
                  <strong style={{ color: primary }}>{className}</strong>
                </span>
                <span>
                  <LiveEditableText
                    value={labels.teacherLabel || 'Teacher:'}
                    editable={editable}
                    onSave={val => updateLabel('teacherLabel', val)}
                    className="inline-block mr-1"
                  />
                  <strong className="text-slate-800">Ms. Sarah Lee</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {columnsList.attendance !== false && (
              <div className="px-3.5 py-1.5 rounded-2xl text-center font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>
                <span className="text-[8.5px] uppercase block opacity-80" style={{ color: primary }}>
                  <LiveEditableText
                    value={labels.attendanceLabel || 'Attendance'}
                    editable={editable}
                    onSave={val => updateLabel('attendanceLabel', val)}
                    className="inline-block"
                  />
                </span>
                <span className="text-base font-black">96%</span>
              </div>
            )}
            {columnsList.admissionNo !== false && (
              <div className="px-3.5 py-1.5 rounded-2xl text-center font-bold border" style={{ backgroundColor: tintMed, color: primary, borderColor: borderTint }}>
                <span className="text-[8.5px] uppercase block opacity-80" style={{ color: primary }}>
                  <LiveEditableText
                    value={labels.studentIdLabel || 'Student ID'}
                    editable={editable}
                    onSave={val => updateLabel('studentIdLabel', val)}
                    className="inline-block"
                  />
                </span>
                <span className="text-base font-mono font-black">{admissionNo}</span>
              </div>
            )}

            {/* Proper QR Code Verification Card */}
            <div className="p-1.5 rounded-2xl border text-center flex flex-col items-center shrink-0 shadow-2xs" style={{ backgroundColor: tintLight, borderColor: borderTint }}>
              <ProperQrCode className="w-14 h-14" color={primary} />
              <LiveEditableText
                value={labels.qrCodeText || 'CODE: MS-2025-042'}
                editable={editable}
                onSave={val => updateLabel('qrCodeText', val)}
                className="text-[6px] font-mono font-bold mt-0.5 inline-block"
                style={{ color: primary }}
              />
            </div>
          </div>
        </div>

        {/* 4 Developmental Domain Cards with Star Ratings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          
          {/* 1. Language Skills */}
          <div className="bg-white border-2 rounded-2xl p-4 shadow-xs" style={{ borderColor: borderTint }}>
            <div className="flex items-center gap-2 font-black text-xs uppercase mb-3 pb-2 border-b" style={{ color: primary, borderColor: borderTint }}>
              <BookOpen className="w-4 h-4" style={{ color: primary }} />
              <LiveEditableText
                value={labels.domain1Heading || '1. Language & Literacy'}
                editable={editable}
                onSave={val => updateLabel('domain1Heading', val)}
                className="inline-block"
              />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Listening & Speaking</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Phonics & Reading</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★☆</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>B+</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Creative Writing</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
            </div>
          </div>

          {/* 2. Numeracy */}
          <div className="bg-white border-2 rounded-2xl p-4 shadow-xs" style={{ borderColor: borderTint }}>
            <div className="flex items-center gap-2 font-black text-xs uppercase mb-3 pb-2 border-b" style={{ color: primary, borderColor: borderTint }}>
              <Compass className="w-4 h-4" style={{ color: primary }} />
              <LiveEditableText
                value={labels.domain2Heading || '2. Numeracy & Logic'}
                editable={editable}
                onSave={val => updateLabel('domain2Heading', val)}
                className="inline-block"
              />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Number Recognition</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Counting & Sorting</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★☆</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>B+</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Problem Solving</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
            </div>
          </div>

          {/* 3. Creative Arts */}
          <div className="bg-white border-2 rounded-2xl p-4 shadow-xs" style={{ borderColor: borderTint }}>
            <div className="flex items-center gap-2 font-black text-xs uppercase mb-3 pb-2 border-b" style={{ color: primary, borderColor: borderTint }}>
              <Palette className="w-4 h-4" style={{ color: primary }} />
              <LiveEditableText
                value={labels.domain3Heading || '3. Creative Expression & Arts'}
                editable={editable}
                onSave={val => updateLabel('domain3Heading', val)}
                className="inline-block"
              />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Arts & Crafts</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Music & Movement</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>Outstanding</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Dramatic Play</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
            </div>
          </div>

          {/* 4. Social Habits */}
          <div className="bg-white border-2 rounded-2xl p-4 shadow-xs" style={{ borderColor: borderTint }}>
            <div className="flex items-center gap-2 font-black text-xs uppercase mb-3 pb-2 border-b" style={{ color: primary, borderColor: borderTint }}>
              <Heart className="w-4 h-4" style={{ color: primary }} />
              <LiveEditableText
                value={labels.domain4Heading || '4. Social Habits & Motor Skills'}
                editable={editable}
                onSave={val => updateLabel('domain4Heading', val)}
                className="inline-block"
              />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Sharing & Kindness</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Listening to Instructions</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★☆</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>B+</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Gross & Fine Motor</span>
                <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
            </div>
          </div>

        </div>

        {/* Achievement Ribbon & Teacher Quote */}
        <div className="border-2 rounded-2xl p-5 my-6 flex flex-col sm:flex-row items-center gap-4" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
          <div 
            className="w-16 h-16 rounded-2xl text-white flex flex-col items-center justify-center shadow-md shrink-0"
            style={{ backgroundColor: primary }}
          >
            <Trophy className="w-8 h-8" />
            <span className="text-[7.5px] font-black uppercase">
              <LiveEditableText
                value={labels.wayToGoLabel || 'WAY TO GO!'}
                editable={editable}
                onSave={val => updateLabel('wayToGoLabel', val)}
                className="inline-block"
              />
            </span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: primary }}>
              <LiveEditableText
                value={labels.teacherRemarksTitle || "Teacher's Encouraging Remarks"}
                editable={editable}
                onSave={val => updateLabel('teacherRemarksTitle', val)}
                className="inline-block"
              />
            </span>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">
              <LiveEditableText
                tag="span"
                multiline
                value={labels.teacherRemarksText || `"${studentName} is a joyful and creative learner! They show great enthusiasm in collaborative group work and storytelling. Keep shining bright!"`}
                editable={editable}
                onSave={val => updateLabel('teacherRemarksText', val)}
                className="inline-block"
              />
            </p>
            <span className="text-[10px] italic block mt-1" style={{ color: primary }}>"Every child is a story waiting to be told."</span>
          </div>
        </div>

        {/* Parent Feedback & Signature */}
        <div className="pt-4 border-t-2 flex flex-wrap items-center justify-around gap-6 text-center text-xs" style={{ borderColor: borderTint }}>
          {columnsList.teacherSign !== false && (
            <div>
              <div className="h-8 border-b border-slate-300 font-cursive italic text-slate-700 text-sm">Ms. Sarah Lee</div>
              <span className="text-[10px] font-bold uppercase text-slate-500 mt-1 block">
                <LiveEditableText
                  value={labels.teacherSignLabel || 'Class Teacher'}
                  editable={editable}
                  onSave={val => updateLabel('teacherSignLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}
          {columnsList.parentSign !== false && (
            <div>
              <div className="h-8 border-b border-slate-300 font-cursive italic text-slate-700 text-sm">Parent Sign</div>
              <span className="text-[10px] font-bold uppercase text-slate-500 mt-1 block">
                <LiveEditableText
                  value={labels.parentSignLabel || 'Parent / Guardian Feedback & Signature'}
                  editable={editable}
                  onSave={val => updateLabel('parentSignLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}
          {columnsList.principalSign !== false && (
            <div>
              <div className="h-8 border-b border-slate-300 font-serif italic text-slate-700 text-sm">{principalName}</div>
              <span className="text-[10px] font-bold uppercase text-slate-500 mt-1 block">
                <LiveEditableText
                  value={labels.principalSignLabel || 'Principal / Headmistress'}
                  editable={editable}
                  onSave={val => updateLabel('principalSignLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}
        </div>

      </div>
    )
  }

  // =========================================================================
  // TEMPLATE 1: CBSE ROYAL EMERALD & GOLD (OFFICIAL BOARD FORMAT) - DEFAULT
  // =========================================================================
  return (
    <div className="w-full max-w-[800px] bg-white text-slate-900 rounded-sm shadow-2xl p-7 md:p-9 font-sans border-8 select-none" style={{ borderColor: primary }}>
      <div className="border-2 p-5 md:p-7 relative bg-white" style={{ borderColor: borderTint }}>
        
        {/* Heraldic Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-5 border-b-2" style={{ borderColor: primary }}>
          {/* School Emblem / Logo */}
          <div className="flex items-center gap-4">
            {showLogo && (
              <div 
                className="shrink-0 flex items-center justify-center overflow-hidden rounded-full border-2 shadow-md p-1"
                style={{ 
                  width: `${actualLogoWidth}px`, 
                  height: `${actualLogoWidth}px`,
                  backgroundColor: schoolLogo ? 'transparent' : primary,
                  borderColor: borderTint
                }}
              >
                {schoolLogo ? (
                  <img
                    src={schoolLogo}
                    alt={schoolName || 'School Logo'}
                    className="w-full h-full object-contain rounded-full"
                  />
                ) : (
                  <SampleSchoolLogo width={actualLogoWidth - 8} height={actualLogoWidth - 8} color="#ffffff" />
                )}
              </div>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight" style={{ color: primary }}>
                <LiveEditableText
                  tag="span"
                  value={schoolName}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolName', val)}
                  className="inline-block"
                />
              </h1>
              <p className="text-[11px] font-bold mt-0.5" style={{ color: primary }}>
                <LiveEditableText
                  value={affiliateTo}
                  editable={editable}
                  onSave={val => onUpdateField?.('affiliateTo', val)}
                  className="inline-block"
                /> • {labels.schoolCodeLabel || 'SCHOOL CODE:'}{' '}
                <LiveEditableText
                  value={schoolCode}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolCode', val)}
                  className="inline-block"
                />
              </p>
              {phone && (
                <p className="text-[10px] text-slate-500">
                  {labels.phoneLabel || 'Ph:'}{' '}
                  <LiveEditableText
                    value={phone}
                    editable={editable}
                    onSave={val => onUpdateField?.('phone', val)}
                    className="inline-block"
                  />
                </p>
              )}
            </div>
          </div>

          {/* Student Photo */}
          {showStudentPhoto && (
            <div className="flex flex-col items-center shrink-0">
              <div className="w-16 h-20 bg-slate-50 border-2 overflow-hidden flex items-center justify-center shadow-xs rounded-sm" style={{ borderColor: primary }}>
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentName)}`}
                  alt={studentName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
                <LiveEditableText
                  value={labels.candidatePhotoLabel || 'Candidate'}
                  editable={editable}
                  onSave={val => updateLabel('candidatePhotoLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}
        </div>

        {/* Golden Ribbon Title */}
        <div className="my-4 text-center">
          <div 
            className="inline-block px-8 py-1.5 rounded-full text-white font-black text-xs md:text-sm tracking-wider uppercase shadow-md border"
            style={{ 
              background: `linear-gradient(135deg, ${primary}, ${hexToRgba(primary, 0.85)})`,
              borderColor: borderTint
            }}
          >
            <LiveEditableText
              value={headingHeader || 'ANNUAL PROGRESS REPORT CARD'}
              editable={editable}
              onSave={val => onUpdateField?.('headingHeader', val)}
              className="inline-block"
            />
          </div>
          <div className="text-[11px] font-black mt-1.5 uppercase tracking-wide" style={{ color: primary }}>
            <LiveEditableText
              value={labels.sessionTitle || 'ACADEMIC SESSION:'}
              editable={editable}
              onSave={val => updateLabel('sessionTitle', val)}
              className="inline-block mr-1"
            />
            <LiveEditableText
              value={academicYear}
              editable={editable}
              onSave={val => onUpdateField?.('academicYear', val)}
              className="inline-block mr-1"
            /> •{' '}
            <LiveEditableText
              value={labels.affilCbseTitle || 'AFFILIATED TO CBSE'}
              editable={editable}
              onSave={val => updateLabel('affilCbseTitle', val)}
              className="inline-block"
            />
          </div>
        </div>

        {/* Student Profile Grid */}
        <div className="rounded-xl p-4 my-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              <LiveEditableText
                value={labels.studentNameLabel || "Student's Name"}
                editable={editable}
                onSave={val => updateLabel('studentNameLabel', val)}
                className="inline-block"
              />
            </span>
            <span className="font-black text-slate-900 text-sm">{studentName}</span>
          </div>
          {columnsList.rollNumber !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                <LiveEditableText
                  value={labels.rollNoLabel || 'Roll Number'}
                  editable={editable}
                  onSave={val => updateLabel('rollNoLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-mono font-bold text-slate-800">{rollNo}</span>
            </div>
          )}
          {columnsList.admissionNo !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                <LiveEditableText
                  value={labels.admissionNoLabel || 'Admission No.'}
                  editable={editable}
                  onSave={val => updateLabel('admissionNoLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-mono font-bold text-slate-800">{admissionNo}</span>
            </div>
          )}
          {columnsList.classSection !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                <LiveEditableText
                  value={labels.classSectionLabel || 'Class & Section'}
                  editable={editable}
                  onSave={val => updateLabel('classSectionLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-slate-800">{className} {sectionName ? `(${sectionName})` : ''}</span>
            </div>
          )}
          {columnsList.fatherName !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                <LiveEditableText
                  value={labels.fatherNameLabel || "Father's Name"}
                  editable={editable}
                  onSave={val => updateLabel('fatherNameLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-semibold text-slate-700">{fatherName}</span>
            </div>
          )}
          {columnsList.motherName !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                <LiveEditableText
                  value={labels.motherNameLabel || "Mother's Name"}
                  editable={editable}
                  onSave={val => updateLabel('motherNameLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-semibold text-slate-700">{motherName}</span>
            </div>
          )}
          {columnsList.dob !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                <LiveEditableText
                  value={labels.dobLabel || 'Date of Birth'}
                  editable={editable}
                  onSave={val => updateLabel('dobLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-semibold text-slate-700">{dob}</span>
            </div>
          )}
          {columnsList.attendance !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                <LiveEditableText
                  value={labels.attendanceLabel || 'Attendance'}
                  editable={editable}
                  onSave={val => updateLabel('attendanceLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-semibold text-slate-700">{attendance}</span>
            </div>
          )}
          {columnsList.gender && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Gender</span>
              <span className="font-semibold text-slate-700">Male</span>
            </div>
          )}
          {columnsList.mobileNumber && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Mobile</span>
              <span className="font-semibold text-slate-700">9876543210</span>
            </div>
          )}
        </div>

        {/* Part 1: Scholastic Areas Table */}
        <div className="mb-4">
          <div 
            className="text-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-t-lg shadow-2xs"
            style={{ backgroundColor: primary }}
          >
            <LiveEditableText
              value={labels.part1Heading || 'PART 1: SCHOLASTIC AREAS'}
              editable={editable}
              onSave={val => updateLabel('part1Heading', val)}
              className="inline-block"
            />
          </div>
          <div className="overflow-x-auto border-x border-b rounded-b-lg shadow-2xs" style={{ borderColor: borderTint }}>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-white font-bold text-[10px] uppercase" style={{ backgroundColor: primary, opacity: 0.95 }}>
                  <th className="px-3.5 py-2">
                    <LiveEditableText value={labels.thSubjects || 'SCHOLASTIC SUBJECTS'} editable={editable} onSave={val => updateLabel('thSubjects', val)} />
                  </th>
                  <th className="px-3.5 py-2 text-center">
                    <LiveEditableText value={labels.thTheory || 'THEORY (80)'} editable={editable} onSave={val => updateLabel('thTheory', val)} />
                  </th>
                  <th className="px-3.5 py-2 text-center">
                    <LiveEditableText value={labels.thPractical || 'PRACTICAL / ASMT (20)'} editable={editable} onSave={val => updateLabel('thPractical', val)} />
                  </th>
                  <th className="px-3.5 py-2 text-center">
                    <LiveEditableText value={labels.thTotal || 'TOTAL MARKS (100)'} editable={editable} onSave={val => updateLabel('thTotal', val)} />
                  </th>
                  <th className="px-3.5 py-2 text-center">
                    <LiveEditableText value={labels.thPct || 'PERCENTAGE (%)'} editable={editable} onSave={val => updateLabel('thPct', val)} />
                  </th>
                  <th className="px-3.5 py-2 text-center">
                    <LiveEditableText value={labels.thGrade || 'GRADE'} editable={editable} onSave={val => updateLabel('thGrade', val)} />
                  </th>
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
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-black border"
                          style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}
                        >
                          {grade}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                <tr className="font-black text-xs border-t-2" style={{ backgroundColor: tintLight, borderColor: primary }}>
                  <td className="px-3.5 py-2.5" style={{ color: primary }}>
                    <LiveEditableText
                      value={labels.totalLabel || 'TOTAL'}
                      editable={editable}
                      onSave={val => updateLabel('totalLabel', val)}
                      className="inline-block mr-1"
                    /> (Out of {totalMax})
                  </td>
                  <td colSpan={2} className="px-3.5 py-2.5 text-center text-slate-700">
                    <LiveEditableText
                      value={labels.overallPctLabel || 'OVERALL PERCENTAGE:'}
                      editable={editable}
                      onSave={val => updateLabel('overallPctLabel', val)}
                      className="inline-block mr-1"
                    /> {percentage}%
                  </td>
                  <td className="px-3.5 py-2.5 text-center text-sm font-black" style={{ color: primary }}>{totalObt}</td>
                  <td className="px-3.5 py-2.5 text-center font-bold" style={{ color: primary }}>{percentage}%</td>
                  <td className="px-3.5 py-2.5 text-center font-black" style={{ color: primary }}>A1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Part 2: Co-Scholastic & Part 3: Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {/* Co-Scholastic */}
          <div className="border rounded-lg overflow-hidden shadow-2xs" style={{ borderColor: borderTint }}>
            <div className="text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: primary }}>
              <LiveEditableText
                value={labels.part2Heading || 'PART 2: CO-SCHOLASTIC AREAS (3-POINT SCALE: A, B, C)'}
                editable={editable}
                onSave={val => updateLabel('part2Heading', val)}
                className="inline-block"
              />
            </div>
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-100 font-semibold">
                <tr><td className="px-3 py-1.5 text-slate-700">Work Education</td><td className="px-3 py-1.5 text-right font-black" style={{ color: primary }}>A1</td></tr>
                <tr><td className="px-3 py-1.5 text-slate-700">Art Education</td><td className="px-3 py-1.5 text-right font-black" style={{ color: primary }}>A1</td></tr>
                <tr><td className="px-3 py-1.5 text-slate-700">Health & Physical Education</td><td className="px-3 py-1.5 text-right font-black" style={{ color: primary }}>A1</td></tr>
                <tr><td className="px-3 py-1.5 text-slate-700">Discipline</td><td className="px-3 py-1.5 text-right font-black" style={{ color: primary }}>A</td></tr>
              </tbody>
            </table>
          </div>

          {/* Teacher Remarks & Result */}
          <div className="border rounded-lg overflow-hidden p-3.5 flex flex-col justify-between shadow-2xs" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
            {columnsList.remarks !== false && (
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block mb-1" style={{ color: primary }}>
                  <LiveEditableText
                    value={labels.part3Heading || "PART 3: CLASS TEACHER'S REMARKS"}
                    editable={editable}
                    onSave={val => updateLabel('part3Heading', val)}
                    className="inline-block"
                  />
                </span>
                <p className="text-xs text-slate-700 italic">
                  <LiveEditableText
                    tag="span"
                    multiline
                    value={labels.teacherRemarksText || `"${studentName} is a dedicated, hardworking student with excellent academic performance and leadership qualities. Best wishes for the future!"`}
                    editable={editable}
                    onSave={val => updateLabel('teacherRemarksText', val)}
                    className="inline-block"
                  />
                </p>
              </div>
            )}
            {columnsList.result !== false && (
              <div className="mt-2 text-[10px] font-black uppercase" style={{ color: primary }}>
                <LiveEditableText
                  value={labels.aggregateGradeLabel || 'AGGREGATE GRADE: A1 • RESULT: PASSED'}
                  editable={editable}
                  onSave={val => updateLabel('aggregateGradeLabel', val)}
                  className="inline-block"
                />
              </div>
            )}
          </div>
        </div>

        {/* Official Signatures, Seal & Proper QR Code */}
        <div className="pt-6 mt-4 border-t-2 border-[#065f46] flex flex-wrap items-end justify-between gap-4 text-center text-xs" style={{ borderColor: primary }}>
          {/* Class Teacher */}
          {columnsList.teacherSign !== false && (
            <div>
              <div className="w-32 border-b border-slate-400 mb-1 pb-1 text-[11px] font-cursive italic text-slate-600">
                Preeti Saxena
              </div>
              <span className="text-[10px] font-black uppercase text-slate-600">
                <LiveEditableText
                  value={labels.teacherSignLabel || 'Class Teacher'}
                  editable={editable}
                  onSave={val => updateLabel('teacherSignLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}

          {/* Exam Controller / In-Charge */}
          {columnsList.controllerSign !== false && (
            <div>
              <div className="w-32 border-b border-slate-400 mb-1 pb-1 text-[11px] font-serif italic text-slate-600">
                Exam Controller
              </div>
              <span className="text-[10px] font-black uppercase text-slate-600">
                <LiveEditableText
                  value={labels.examInChargeSignLabel || 'Exam Controller'}
                  editable={editable}
                  onSave={val => updateLabel('examInChargeSignLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}

          {/* Official Seal Stamp */}
          {showHeaderStamp && (
            <div className="flex flex-col items-center select-none">
              <div className="w-16 h-16 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1 text-[7px] font-black uppercase text-center shadow-xs" style={{ borderColor: primary, color: primary }}>
                <Award className="w-4 h-4 mb-0.5 text-amber-600" />
                <LiveEditableText
                  value={labels.officialSealLabel || 'OFFICIAL SEAL'}
                  editable={editable}
                  onSave={val => updateLabel('officialSealLabel', val)}
                  className="text-[6.5px] uppercase font-bold inline-block"
                />
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-mono">DATE: {new Date().toLocaleDateString('en-GB')}</span>
            </div>
          )}

          {/* Proper QR Code Verification Card */}
          <div className="bg-white p-1.5 rounded-lg border border-slate-300 shadow-2xs flex flex-col items-center select-none">
            <ProperQrCode className="w-18 h-18" color={primary} />
            <span className="text-[7px] font-black uppercase tracking-wider text-slate-500 mt-0.5">
              <LiveEditableText
                value={labels.qrVerifyLabel || 'Official Marksheet QR'}
                editable={editable}
                onSave={val => updateLabel('qrVerifyLabel', val)}
                className="inline-block"
              />
            </span>
            <LiveEditableText
              value={labels.qrCodeText || 'CODE: MS-2025-042'}
              editable={editable}
              onSave={val => updateLabel('qrCodeText', val)}
              className="text-[6.5px] font-mono font-bold text-slate-500 inline-block"
            />
          </div>

          {/* Parent / Guardian Sign */}
          {columnsList.parentSign && (
            <div>
              <div className="w-32 border-b border-slate-400 mb-1 pb-1 text-[11px] font-serif italic text-slate-600">
                Parent Signature
              </div>
              <span className="text-[10px] font-black uppercase text-slate-600">
                <LiveEditableText
                  value={labels.parentSignLabel || 'Parent Sign'}
                  editable={editable}
                  onSave={val => updateLabel('parentSignLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}

          {/* Principal */}
          {columnsList.principalSign !== false && (
            <div>
              <div className="w-36 border-b border-slate-400 mb-1 pb-1 text-[11px] font-serif font-black italic text-slate-800">
                {principalName}
              </div>
              <span className="text-[10px] font-black uppercase text-slate-600">
                <LiveEditableText
                  value={labels.principalSignLabel || 'Principal'}
                  editable={editable}
                  onSave={val => updateLabel('principalSignLabel', val)}
                  className="inline-block"
                />
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export interface MarksheetMiniPreviewProps {
  template: 'CBSE Royal Emerald' | 'Minimalist Modern' | 'Dual-Term Consolidated' | 'Holistic Early Skills' | string
  themeColor?: string
  schoolName?: string
  schoolLogo?: string
  showLogo?: boolean
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
  schoolLogo,
  showLogo = true,
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
            <div className="flex items-center gap-1.5 min-w-0">
              {showLogo && (
                schoolLogo ? (
                  <img src={schoolLogo} alt="Logo" className="w-5 h-5 rounded-full object-contain shrink-0" />
                ) : (
                  <SampleSchoolLogo width={20} height={20} color={primary} className="shrink-0" />
                )
              )}
              <div className="min-w-0">
                <div className="text-[7.5px] font-black leading-tight uppercase truncate max-w-[120px]" style={{ color: primary }}>
                  {schoolName}
                </div>
                <div className="text-[5px] text-amber-800 font-bold leading-none">Affiliated to CBSE • Code: 123456</div>
              </div>
            </div>
            <span className="text-[5px] font-black uppercase px-1 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: primary }}>
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
            <div className="flex items-center gap-1.5 min-w-0">
              {showLogo && (
                schoolLogo ? (
                  <img src={schoolLogo} alt="Logo" className="w-4.5 h-4.5 rounded object-contain shrink-0" />
                ) : (
                  <SampleSchoolLogo width={18} height={18} color={primary} className="shrink-0" />
                )
              )}
              <div className="min-w-0">
                <div className="text-[7.5px] font-black uppercase leading-tight truncate max-w-[110px]" style={{ color: primary }}>
                  {schoolName}
                </div>
                <div className="text-[5px] text-slate-400 font-semibold">{examName}</div>
              </div>
            </div>
            <span className="text-[4.5px] font-black uppercase px-1.5 py-0.5 rounded-full text-white shadow-2xs shrink-0" style={{ backgroundColor: primary }}>
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
            <div className="flex items-center justify-center gap-1.5 min-w-0">
              {showLogo && (
                schoolLogo ? (
                  <img src={schoolLogo} alt="Logo" className="w-4.5 h-4.5 rounded-full object-contain shrink-0" />
                ) : (
                  <SampleSchoolLogo width={18} height={18} color={primary} className="shrink-0" />
                )
              )}
              <div className="text-[7.5px] font-serif font-black uppercase tracking-wide truncate max-w-[130px]" style={{ color: primary }}>
                {schoolName}
              </div>
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
            <div className="flex items-center justify-center gap-1 min-w-0">
              {showLogo && (
                schoolLogo ? (
                  <img src={schoolLogo} alt="Logo" className="w-4 h-4 rounded-full object-contain shrink-0" />
                ) : (
                  <SampleSchoolLogo width={16} height={16} color={primary} className="shrink-0" />
                )
              )}
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500 shrink-0" />
              <span className="text-[7.5px] font-black uppercase tracking-tight truncate max-w-[120px]" style={{ color: primary }}>
                {schoolName}
              </span>
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500 shrink-0" />
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


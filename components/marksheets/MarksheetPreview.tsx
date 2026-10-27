'use client'

import React, { useState, useEffect } from 'react'
import { Award, CheckCircle2, ShieldCheck, QrCode, Sparkles, School, Star, BookOpen, Heart, Activity, Palette, Compass, Trophy, User, Check, Upload } from 'lucide-react'
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
  classRank?: string | number
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
  cgpaRanges?: Array<{ range: string; cgpa: string }>
  enableGrade?: boolean
  enableCgpa?: boolean
  enablePercentage?: boolean
  enableDivision?: boolean
  showStudentPhoto?: boolean
  showRoundBorderPhoto?: boolean
  showTestMarks?: boolean
  showHeaderSign?: boolean
  showHeaderStamp?: boolean
  columnsList?: Record<string, boolean>
  editable?: boolean
  customLabels?: Record<string, string>
  headerNameFontSize?: string
  headingFontSize?: string
  headerDetailsFontSize?: string
  dateOfIssue?: string
  qrCodeSize?: string | number
  signatureOrder?: string[]
  signatureWidth?: string | number
  signatureFontSize?: string | number
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
  headerNameFontSize = '22',
  headingFontSize = '14',
  headerDetailsFontSize = '11',
  dateOfIssue = '25/03/2026',
  qrCodeSize = '72',
  signatureOrder = ['teacherSign', 'controllerSign', 'parentSign', 'principalSign'],
  signatureWidth = '110',
  signatureFontSize = '10',
  className = 'Class 10',
  sectionName = 'Section A',
  studentName = 'Rahul Verma',
  rollNo = '23',
  admissionNo = '4567',
  fatherName = 'Vikram Verma',
  motherName = 'Sunita Verma',
  dob = '12/05/2008',
  attendance = '188 / 200 Days (94%)',
  classRank = '3',
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
  divisionRanges = [
    { range: '75-100', div: '1st' },
    { range: '60-74', div: '2nd' },
    { range: '33-59', div: '3rd' },
    { range: '0-33', div: 'Failed' }
  ],
  cgpaRanges = [
    { range: '91-100', cgpa: '10.0' },
    { range: '81-90', cgpa: '9.0' },
    { range: '71-80', cgpa: '8.0' },
    { range: '61-70', cgpa: '7.0' },
    { range: '51-60', cgpa: '6.0' },
    { range: '41-50', cgpa: '5.0' },
    { range: '33-40', cgpa: '4.0' },
    { range: '00-32', cgpa: '0.0' }
  ],
  enableGrade,
  enableCgpa,
  enablePercentage,
  enableDivision,
  showStudentPhoto = true,
  showRoundBorderPhoto = true,
  showTestMarks = true,
  showHeaderSign = true,
  showHeaderStamp = true,
  columnsList = {
    schoolAffiliation: true, rollNumber: true, motherName: true, fatherName: true, admissionNo: true,
    classSection: true, dob: true, attendance: true, dateOfIssue: true,
    obtMarks: true, totalMarks: true
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
    part1Heading: "SCHOLASTIC AREAS",
    thSubjects: "SUBJECT",
    thMaxMarks: "MAX MARKS",
    thTheory: "THEORY",
    thPractical: "PRACTICAL",
    thObtained: "OBTAIN MARKS",
    thTotal: "TOTAL MARKS",
    thPct: "PERCENTAGE (%)",
    thGrade: "GRADE",
    thCgpa: "CGPA",
    totalLabel: "TOTAL / AVERAGE",
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
    totalScoreLabel: "FINAL MARKS",
    overallRemarksHeading: "Overall Remarks",
    percentageBadge: "PERCENTAGE:",
    cgpaBadge: "CGPA:",
    gradeBadge: "GRADE:",
    divisionBadge: "DIVISION:",
    classRankBadge: "RANK:",

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
    percentScaleHeading: "PERCENTAGE REMARKS SCALE",
    divisionScaleHeading: "DIVISION CLASSIFICATION SCALE",
    cgpaScaleHeading: "CGPA POINT SCALE",

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

  // Dynamic signature sequence and configuration
  const signOrderList = Array.isArray(signatureOrder) && signatureOrder.length > 0
    ? signatureOrder
    : ['teacherSign', 'controllerSign', 'parentSign', 'principalSign']

  const signDefinitions: Record<string, {
    key: string
    labelKey: string
    title: string
    name: string
    cursiveFont?: boolean
    isPrincipal?: boolean
  }> = {
    teacherSign: {
      key: 'teacherSign',
      labelKey: 'teacherSignLabel',
      title: labels.teacherSignLabel || 'Class Teacher',
      name: 'Preeti Saxena',
      cursiveFont: true
    },
    controllerSign: {
      key: 'controllerSign',
      labelKey: 'examInChargeSignLabel',
      title: labels.examInChargeSignLabel || 'Exam In-Charge',
      name: 'Exam Controller'
    },
    parentSign: {
      key: 'parentSign',
      labelKey: 'parentSignLabel',
      title: labels.parentSignLabel || 'Parent / Guardian',
      name: 'Parent Signature'
    },
    principalSign: {
      key: 'principalSign',
      labelKey: 'principalSignLabel',
      title: labels.principalSignLabel || 'Principal',
      name: principalName || 'Principal',
      isPrincipal: true
    }
  }

  const activeMarksheetSigns: Array<{
    key: string
    labelKey: string
    title: string
    name: string
    cursiveFont?: boolean
    isPrincipal?: boolean
  }> = []

  for (const k of signOrderList) {
    if (columnsList[k] !== false && signDefinitions[k]) {
      activeMarksheetSigns.push(signDefinitions[k])
    }
  }
  for (const k of Object.keys(signDefinitions)) {
    if (columnsList[k] !== false && !signOrderList.includes(k) && signDefinitions[k]) {
      activeMarksheetSigns.push(signDefinitions[k])
    }
  }

  // Ensure fallback subjects
  const activeSubjects = subjects && subjects.length > 0 ? subjects : [
    { subjectName: 'English Communicative', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '90', grade: 'A1' },
    { subjectName: 'Mathematics Standard', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '93', grade: 'A1' },
    { subjectName: 'Science', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '88', grade: 'A1' },
    { subjectName: 'Social Science', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '88', grade: 'A1' },
    { subjectName: 'Information Technology', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '90', grade: 'A1' }
  ]

  // Practical detection
  const hasAnyPractical = activeSubjects.some(s => !!s.practicalColumn)

  // Grading & CGPA evaluation helpers
  const getGradeForPct = (pct: number): string => {
    if (gradeRanges && gradeRanges.length > 0) {
      for (const item of gradeRanges) {
        const parts = item.range.split('-')
        if (parts.length === 2) {
          const n1 = parseFloat(parts[0])
          const n2 = parseFloat(parts[1])
          if (!isNaN(n1) && !isNaN(n2)) {
            const low = Math.min(n1, n2)
            const high = Math.max(n1, n2)
            if (pct >= low && pct <= high) {
              return item.grade
            }
          }
        }
      }
    }
    return pct >= 90 ? 'A1' : pct >= 80 ? 'A2' : pct >= 70 ? 'B1' : pct >= 60 ? 'B2' : pct >= 50 ? 'C1' : pct >= 40 ? 'C2' : pct >= 33 ? 'D' : 'E'
  }

  const getCgpaForPct = (pct: number): string => {
    if (cgpaRanges && cgpaRanges.length > 0) {
      for (const item of cgpaRanges) {
        const parts = item.range.split('-')
        if (parts.length === 2) {
          const n1 = parseFloat(parts[0])
          const n2 = parseFloat(parts[1])
          if (!isNaN(n1) && !isNaN(n2)) {
            const low = Math.min(n1, n2)
            const high = Math.max(n1, n2)
            if (pct >= low && pct <= high) {
              return item.cgpa
            }
          }
        }
      }
    }
    return Math.min(10.0, Math.max(0, (pct / 9.5))).toFixed(1)
  }

  const getDivisionForPct = (pct: number): string => {
    if (divisionRanges && divisionRanges.length > 0) {
      for (const item of divisionRanges) {
        const parts = item.range.split('-')
        if (parts.length === 2) {
          const n1 = parseFloat(parts[0])
          const n2 = parseFloat(parts[1])
          if (!isNaN(n1) && !isNaN(n2)) {
            const low = Math.min(n1, n2)
            const high = Math.max(n1, n2)
            if (pct >= low && pct <= high) {
              return item.div
            }
          }
        }
      }
    }
    return pct >= 75 ? '1st' : pct >= 60 ? '2nd' : pct >= 33 ? '3rd' : 'Failed'
  }

  const totalMax = activeSubjects.reduce((acc, s) => acc + (Number(s.maxMarks) || 100), 0)
  const totalObt = activeSubjects.reduce((acc, s, i) => acc + (Number(s.obtainedMarks) || Math.floor(86 + (i * 2) % 12)), 0)
  const totalTheory = activeSubjects.reduce((acc, s, i) => {
    const max = Number(s.maxMarks) || 100
    const obt = Number(s.obtainedMarks) || Math.floor(86 + (i * 2) % 12)
    if (s.practicalColumn) {
      const pMarks = Number(s.practicalMarks) || 20
      const pObt = Math.min(pMarks, Math.round(pMarks * (obt / max))) || (18 + (i % 3))
      return acc + Math.max(0, obt - pObt)
    }
    return acc + obt
  }, 0)
  const totalPrac = activeSubjects.reduce((acc, s, i) => {
    if (s.practicalColumn) {
      const max = Number(s.maxMarks) || 100
      const obt = Number(s.obtainedMarks) || Math.floor(86 + (i * 2) % 12)
      const pMarks = Number(s.practicalMarks) || 20
      const pObt = Math.min(pMarks, Math.round(pMarks * (obt / max))) || (18 + (i % 3))
      return acc + pObt
    }
    return acc
  }, 0)
  const percentage = ((totalObt / totalMax) * 100).toFixed(1)
  const overallPct = Math.round(Number(percentage))
  const averageGrade = getGradeForPct(overallPct)
  const averageCgpa = getCgpaForPct(overallPct)
  const averageDivision = getDivisionForPct(overallPct)

  // Step 2 conditional visibility for Grade, CGPA, Percentage, and Division
  const showGradeColumn = enableGrade !== undefined ? !!enableGrade : (columnsList.grade !== false)
  const showCgpaColumn = enableCgpa !== undefined ? !!enableCgpa : (columnsList.cgpa === true)
  const showPercentage = enablePercentage !== undefined ? !!enablePercentage : (columnsList.percentage !== false)
  const showDivision = enableDivision !== undefined ? !!enableDivision : (columnsList.division !== false)

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

  const renderInteractiveLogo = (customContainerClass?: string, isRound: boolean = false) => {
    if (!showLogo) return null
    return (
      <div
        onClick={() => {
          if (editable) onUpdateField?.('triggerLogoUpload', true)
        }}
        title={editable ? 'Click to select / upload institute logo' : undefined}
        className={`shrink-0 flex items-center justify-center relative group overflow-hidden ${customContainerClass || ''} ${
          isRound ? 'rounded-full' : 'rounded-xl'
        } ${editable ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all' : ''}`}
        style={{
          width: `${actualLogoWidth}px`,
          height: `${actualLogoWidth}px`,
          backgroundColor: isRound && !schoolLogo ? primary : 'transparent',
          borderColor: isRound ? borderTint : undefined
        }}
      >
        {schoolLogo ? (
          <img
            src={schoolLogo}
            alt={schoolName || 'School Logo'}
            className={`w-full h-full object-contain ${isRound ? 'rounded-full' : ''}`}
          />
        ) : (
          <SampleSchoolLogo
            width={isRound ? actualLogoWidth - 8 : actualLogoWidth}
            height={isRound ? actualLogoWidth - 8 : actualLogoWidth}
            color={isRound ? '#ffffff' : primary}
          />
        )}
        {editable && (
          <div className={`absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[7.5px] font-black transition-opacity ${isRound ? 'rounded-full' : 'rounded-xl'}`}>
            <Upload className="w-3.5 h-3.5 mb-0.5" />
            <span>Change</span>
          </div>
        )}
      </div>
    )
  }

  // Render Absolute Bottom Scales (Grade Point Scale, Percentage Remarks, Division, CGPA - based on Step 2 ON toggles)
  const renderScalesFooter = (extraClass?: string, isRound: boolean = false) => {
    const scalesToRender: Array<{
      id: string
      heading: string
      labelKey: string
      items: Array<{ range: string; value: string }>
      suffix?: string
    }> = []

    // 1. Subject Grade Range -> Grade Point Scale
    if (showGradeColumn && gradeRanges && gradeRanges.length > 0) {
      scalesToRender.push({
        id: 'grade',
        heading: labels.gradeScaleHeading || 'GRADE POINT SCALE',
        labelKey: 'gradeScaleHeading',
        items: gradeRanges.map(g => ({ range: g.range, value: g.grade }))
      })
    }

    // 2. Percentage Remarks Range -> Percentage Remarks Scale
    if (showPercentage && percentRanges && percentRanges.length > 0) {
      scalesToRender.push({
        id: 'percentage',
        heading: labels.percentScaleHeading || 'PERCENTAGE REMARKS SCALE',
        labelKey: 'percentScaleHeading',
        items: percentRanges.map(p => ({ range: p.range, value: p.remark })),
        suffix: '%'
      })
    }

    // 3. Division Remarks Range -> Division Classification Scale
    if (showDivision && divisionRanges && divisionRanges.length > 0) {
      scalesToRender.push({
        id: 'division',
        heading: labels.divisionScaleHeading || 'DIVISION CLASSIFICATION SCALE',
        labelKey: 'divisionScaleHeading',
        items: divisionRanges.map(d => ({ range: d.range, value: d.div })),
        suffix: '%'
      })
    }

    // 4. CGPA Remarks Range -> CGPA Point Scale
    if (showCgpaColumn && cgpaRanges && cgpaRanges.length > 0) {
      scalesToRender.push({
        id: 'cgpa',
        heading: labels.cgpaScaleHeading || 'CGPA POINT SCALE',
        labelKey: 'cgpaScaleHeading',
        items: cgpaRanges.map(c => ({ range: c.range, value: c.cgpa }))
      })
    }

    if (scalesToRender.length === 0) return null

    return (
      <div className={`w-full space-y-1 mt-auto pt-2.5 ${extraClass || ''}`}>
        {scalesToRender.map(scale => (
          <div
            key={scale.id}
            className={`border overflow-hidden text-[7px] sm:text-[7.5px] font-sans shadow-2xs flex flex-row items-stretch ${
              isRound ? 'rounded-lg' : 'rounded-xs'
            }`}
            style={{ borderColor: borderTint }}
          >
            {/* One-Line Indicator Tag (inline badge rather than a block heading) */}
            <div
              className="text-white font-extrabold px-2 py-0.5 uppercase tracking-wider text-[6.5px] sm:text-[7px] shrink-0 flex items-center justify-center select-none"
              style={{ backgroundColor: primary }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/90 mr-1 shrink-0 inline-block" />
              <LiveEditableText
                value={scale.heading}
                editable={editable}
                onSave={val => updateLabel(scale.labelKey, val)}
                className="inline-block whitespace-nowrap"
              />
            </div>

            {/* Inline Scale Ranges & Values */}
            <div className="flex flex-1 items-center justify-between bg-white py-0.5 px-1 font-semibold min-w-0">
              {scale.items.map((item, idx) => (
                <div
                  key={idx}
                  className="px-1 py-0.5 flex items-center justify-center gap-0.5 border-r border-slate-200 last:border-r-0 shrink-0 text-[6.5px] sm:text-[7px]"
                >
                  <span className="text-slate-600 font-medium">{item.range}{scale.suffix || ''}:</span>
                  <span className="font-black" style={{ color: primary }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderUniversalMarksTable = (tableContainerClass?: string, headerBgColor?: string, isRound: boolean = false) => {
    return (
      <div className={`overflow-x-auto border-x border-b shadow-2xs ${isRound ? 'rounded-b-2xl' : 'rounded-b-lg'} ${tableContainerClass || ''}`} style={{ borderColor: borderTint }}>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-white font-bold text-[10px] uppercase" style={{ backgroundColor: headerBgColor || primary, opacity: 0.95 }}>
              <th className="px-3.5 py-2">
                <LiveEditableText value={labels.thSubjects || 'SUBJECT'} editable={editable} onSave={val => updateLabel('thSubjects', val)} />
              </th>
              <th className="px-2.5 py-2 text-center text-[9px] tracking-tight">
                <LiveEditableText value={labels.thMaxMarks || 'MAX MARKS'} editable={editable} onSave={val => updateLabel('thMaxMarks', val)} />
              </th>
              <th className="px-2.5 py-2 text-center text-[9px] tracking-tight">
                <LiveEditableText value={labels.thTheory || 'THEORY'} editable={editable} onSave={val => updateLabel('thTheory', val)} />
              </th>
              {hasAnyPractical && (
                <th className="px-2.5 py-2 text-center text-[9px] tracking-tight">
                  <LiveEditableText value={labels.thPractical || 'PRACTICAL'} editable={editable} onSave={val => updateLabel('thPractical', val)} />
                </th>
              )}
              <th className="px-2.5 py-2 text-center text-[9px] tracking-tight">
                <LiveEditableText value={labels.thObtained || 'OBTAIN MARKS'} editable={editable} onSave={val => updateLabel('thObtained', val)} />
              </th>
              {showGradeColumn && (
                <th className="px-2 py-2 text-center text-[8.5px] tracking-wider">
                  <LiveEditableText value={labels.thGrade || 'GRADE'} editable={editable} onSave={val => updateLabel('thGrade', val)} />
                </th>
              )}
              {showCgpaColumn && (
                <th className="px-2 py-2 text-center text-[8.5px] tracking-wider">
                  <LiveEditableText value={labels.thCgpa || 'CGPA'} editable={editable} onSave={val => updateLabel('thCgpa', val)} />
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-sans">
            {activeSubjects.map((sub, i) => {
              const max = Number(sub.maxMarks) || 100
              const isPracOn = !!sub.practicalColumn
              const obt = Number(sub.obtainedMarks) || Math.floor(86 + (i * 2) % 12)
              let theory = obt
              let prac: string | number = '-'
              if (isPracOn) {
                const pMarks = Number(sub.practicalMarks) || 20
                const pObt = Math.min(pMarks, Math.round(pMarks * (obt / max))) || (18 + (i % 3))
                prac = pObt
                theory = Math.max(0, obt - pObt)
              }
              const pct = Math.min(100, Math.round((obt / max) * 100))
              const grade = sub.grade || getGradeForPct(pct)
              const cgpa = getCgpaForPct(pct)
              return (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="px-3.5 py-2 font-bold text-slate-800">{sub.subjectName}</td>
                  <td className="px-3 py-2 text-center font-semibold text-slate-700">{max}</td>
                  <td className="px-3 py-2 text-center font-semibold text-slate-600">{theory}</td>
                  {hasAnyPractical && (
                    <td className="px-3 py-2 text-center font-semibold text-slate-600">
                      {prac}
                    </td>
                  )}
                  <td className="px-2.5 py-1.5 text-center font-black text-slate-900 text-[11px]">{obt}</td>
                  {showGradeColumn && (
                    <td className="px-2 py-1.5 text-center">
                      <span 
                        className="px-1.5 py-0.5 rounded text-[8px] font-black border leading-none inline-block"
                        style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}
                      >
                        {grade}
                      </span>
                    </td>
                  )}
                  {showCgpaColumn && (
                    <td className="px-2 py-1.5 text-center font-mono font-bold text-[8.5px] text-slate-700">
                      {cgpa}
                    </td>
                  )}
                </tr>
              )
            })}
            <tr className="font-black text-xs border-t-2" style={{ backgroundColor: tintLight, borderColor: primary }}>
              <td className="px-3.5 py-2.5 font-black uppercase" style={{ color: primary }}>
                <LiveEditableText
                  value={labels.totalLabel || 'TOTAL / AVERAGE'}
                  editable={editable}
                  onSave={val => updateLabel('totalLabel', val)}
                  className="inline-block"
                />
              </td>
              <td className="px-3 py-2.5 text-center font-black text-slate-900">{totalMax}</td>
              <td className="px-3 py-2.5 text-center font-bold text-slate-700">{totalTheory}</td>
              {hasAnyPractical && (
                <td className="px-3 py-2.5 text-center font-bold text-slate-700">{totalPrac}</td>
              )}
              <td className="px-2.5 py-2 text-center text-xs font-black" style={{ color: primary }}>{totalObt}</td>
              {showGradeColumn && (
                <td className="px-2 py-2 text-center">
                  <span 
                    className="px-1.5 py-0.5 rounded text-[8px] font-black border shadow-2xs bg-white inline-block leading-none"
                    style={{ color: primary, borderColor: borderTint }}
                    title={`Average Grade: ${averageGrade}`}
                  >
                    {averageGrade}
                  </span>
                </td>
              )}
              {showCgpaColumn && (
                <td className="px-2 py-2 text-center">
                  <span 
                    className="px-1.5 py-0.5 rounded text-[8px] font-mono font-black border shadow-2xs bg-white inline-block leading-none"
                    style={{ color: primary, borderColor: borderTint }}
                    title={`Average CGPA: ${averageCgpa}`}
                  >
                    {averageCgpa}
                  </span>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  const renderOverallPerformanceCard = (customContainerClass?: string, isRound: boolean = false) => {
    return (
      <div 
        className={`border p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 ${isRound ? 'rounded-2xl' : 'rounded-lg'} ${customContainerClass || 'my-4'}`}
        style={{ borderColor: borderTint, backgroundColor: tintLight }}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {showPercentage && (
            <span className="px-3 py-1 rounded-full text-xs font-black text-white shadow-xs" style={{ backgroundColor: primary }}>
              <LiveEditableText
                value={labels.percentageBadge || 'PERCENTAGE:'}
                editable={editable}
                onSave={val => updateLabel('percentageBadge', val)}
                className="inline-block mr-1"
              />
              {percentage}%
            </span>
          )}
          {showCgpaColumn && (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-800 text-white shadow-xs">
              <LiveEditableText
                value={labels.cgpaBadge || 'CGPA:'}
                editable={editable}
                onSave={val => updateLabel('cgpaBadge', val)}
                className="inline-block mr-1"
              />
              {averageCgpa} / 10.0
            </span>
          )}
          {showGradeColumn && (
            <span className="px-3 py-1 rounded-full text-xs font-black text-white shadow-xs" style={{ backgroundColor: primary, opacity: 0.9 }}>
              <LiveEditableText
                value={labels.gradeBadge || 'GRADE:'}
                editable={editable}
                onSave={val => updateLabel('gradeBadge', val)}
                className="inline-block mr-1"
              />
              {averageGrade}
            </span>
          )}
          {showDivision && (
            <span 
              className="px-3 py-1 rounded-full text-xs font-black text-white shadow-xs"
              style={{ backgroundColor: '#4338ca' }}
            >
              <LiveEditableText
                value={labels.divisionBadge || 'DIVISION:'}
                editable={editable}
                onSave={val => updateLabel('divisionBadge', val)}
                className="inline-block mr-1"
              />
              {averageDivision}
            </span>
          )}
          {columnsList.rank !== false && (
            <span 
              className="px-3 py-1 rounded-full text-xs font-black text-white shadow-xs" 
              style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}
            >
              <LiveEditableText
                value={labels.classRankBadge || 'RANK:'}
                editable={editable}
                onSave={val => updateLabel('classRankBadge', val)}
                className="inline-block mr-1"
              />
              {classRank}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
            <LiveEditableText
              value={labels.totalScoreLabel || 'FINAL MARKS'}
              editable={editable}
              onSave={val => updateLabel('totalScoreLabel', val)}
              className="inline-block"
            />
          </span>
          <span className="text-lg md:text-xl font-black text-slate-900">{totalObt} / {totalMax}</span>
        </div>
      </div>
    )
  }

  // =========================================================================
  // TEMPLATE 2: MINIMALIST MODERN (CANVA / PINTEREST STYLE - TEAL & SLATE)
  // =========================================================================
  if (isMinimalModern) {
    return (
      <div className="w-full max-w-[780px] bg-white text-slate-800 rounded-3xl shadow-2xl p-7 md:p-9 font-sans border select-none" style={{ borderColor: borderTint }}>
        {/* Header Part (Modern & Balanced) */}
        <div className="pb-6 border-b border-slate-100 flex flex-col items-center text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
            {renderInteractiveLogo("", true)}
            <div className="text-center sm:text-left">
              <div 
                className="font-black text-xl md:text-2xl tracking-tight uppercase leading-tight" 
                style={{ color: primary, fontSize: headerNameFontSize ? `${headerNameFontSize}px` : undefined }}
              >
                {!showLogo && <School className="w-7 h-7 inline-block mr-2" style={{ color: primary }} />}
                <LiveEditableText
                  tag="span"
                  value={schoolName}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolName', val)}
                  style={{ fontSize: headerNameFontSize ? `${headerNameFontSize}px` : undefined }}
                  fontSizeControl={{
                    label: 'School Name',
                    value: headerNameFontSize ? parseInt(headerNameFontSize) : 22,
                    onChange: val => onUpdateField?.('headerNameFontSize', val)
                  }}
                  className="inline-block"
                />
              </div>
              {columnsList.schoolAffiliation !== false && (
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                  <LiveEditableText
                    value={affiliateTo || 'Affiliated to CBSE, New Delhi • Affiliation No. 2130842'}
                    editable={editable}
                    onSave={val => onUpdateField?.('affiliateTo', val)}
                    className="inline-block"
                  />
                  <span> • Code: </span>
                  <LiveEditableText
                    value={schoolCode || '123456'}
                    editable={editable}
                    onSave={val => onUpdateField?.('schoolCode', val)}
                    className="inline-block font-mono"
                  />
                </p>
              )}
              {(schoolAddress || phone) && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {schoolAddress && (
                    <LiveEditableText
                      value={schoolAddress}
                      editable={editable}
                      onSave={val => onUpdateField?.('schoolAddress', val)}
                      className="inline-block mr-2"
                    />
                  )}
                  {phone && (
                    <span>• Tel: {phone}</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Report Title & Academic Session Ribbon */}
          <div 
            className="mt-2.5 inline-flex flex-wrap items-center justify-center gap-2 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs"
            style={{ 
              backgroundColor: tintLight, 
              borderColor: borderTint,
              color: primary,
              fontSize: headingFontSize ? `${headingFontSize}px` : undefined
            }}
          >
            <LiveEditableText
              value={headingHeader || 'STUDENT REPORT CARD'}
              editable={editable}
              onSave={val => onUpdateField?.('headingHeader', val)}
              style={{ fontSize: headingFontSize ? `${headingFontSize}px` : undefined }}
              fontSizeControl={{
                label: 'Report Title',
                value: headingFontSize ? parseInt(headingFontSize) : 13,
                onChange: val => onUpdateField?.('headingFontSize', val)
              }}
              className="inline-block"
            />
            <span className="opacity-40">•</span>
            <span className="text-slate-700">
              {labels.academicYearTitle || 'SESSION:'}{' '}
              <LiveEditableText
                value={academicYear}
                editable={editable}
                onSave={val => onUpdateField?.('academicYear', val)}
                className="inline-block"
              />
            </span>
            {columnsList.examName !== false && examName && (
              <>
                <span className="opacity-40">•</span>
                <span className="text-slate-600 font-semibold">{examName}</span>
              </>
            )}
          </div>
        </div>

        {/* Student Detail Part (Redesigned Proper Dossier) */}
        <div className="my-6 bg-slate-50/70 border rounded-2xl p-4 sm:p-5 shadow-xs" style={{ borderColor: borderTint }}>
          
          {/* Top Row: Avatar + Name + Core Badges + Quick Widgets */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 pb-4 border-b border-slate-200/80">
            {/* Identity & Badges */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              {showStudentPhoto && (
                <div 
                  className="w-16 h-16 rounded-2xl border-2 overflow-hidden shrink-0 shadow-sm flex items-center justify-center bg-white"
                  style={{ borderColor: primary }}
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentName)}`}
                    alt={studentName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider block" style={{ color: primary }}>
                  <LiveEditableText
                    value={labels.profileTitle || 'STUDENT PROFILE'}
                    editable={editable}
                    onSave={val => updateLabel('profileTitle', val)}
                    className="inline-block"
                  />
                </span>
                <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">{studentName}</h3>
                
                {/* Core Badges Row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1.5">
                  {columnsList.classSection !== false && (
                    <span 
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                      style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}
                    >
                      Class {className} {sectionName ? `(${sectionName})` : ''}
                    </span>
                  )}
                  {columnsList.rollNumber !== false && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200">
                      Roll: {rollNo}
                    </span>
                  )}
                  {columnsList.admissionNo !== false && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200">
                      ID: {admissionNo}
                    </span>
                  )}
                  {columnsList.rank !== false && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      Rank: #{classRank}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Widgets: Attendance Indicator */}
            {columnsList.attendance !== false && (
              <div className="flex items-center shrink-0">
                <div className="bg-white border rounded-xl px-3 py-2 text-center shadow-2xs min-w-[100px]" style={{ borderColor: borderTint }}>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                    <LiveEditableText
                      value={labels.attendanceIndicator || 'Attendance'}
                      editable={editable}
                      onSave={val => updateLabel('attendanceIndicator', val)}
                      className="inline-block"
                    />
                  </span>
                  <div className="text-base font-black leading-tight" style={{ color: primary }}>96%</div>
                  <span className="text-[8.5px] font-semibold text-slate-500 block">175 / 182 Days</span>
                  <span 
                    className="mt-0.5 px-1.5 py-0.2 rounded-full text-[7.5px] font-bold border inline-block"
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
              </div>
            )}
          </div>

          {/* Bottom Grid: Clear, Spacious Grid of Student Personal Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-3.5 text-xs">
            {columnsList.fatherName !== false && (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 shadow-2xs">
                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">
                  <LiveEditableText
                    value={labels.fatherNameLabel || "Father's Name"}
                    editable={editable}
                    onSave={val => updateLabel('fatherNameLabel', val)}
                    className="inline-block"
                  />
                </span>
                <strong className="text-slate-800 font-bold block truncate">{fatherName}</strong>
              </div>
            )}
            {columnsList.motherName !== false && (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 shadow-2xs">
                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">
                  <LiveEditableText
                    value={labels.motherNameLabel || "Mother's Name"}
                    editable={editable}
                    onSave={val => updateLabel('motherNameLabel', val)}
                    className="inline-block"
                  />
                </span>
                <strong className="text-slate-800 font-bold block truncate">{motherName}</strong>
              </div>
            )}
            {columnsList.dob !== false && (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 shadow-2xs">
                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">
                  <LiveEditableText
                    value={labels.dobLabel || "Date of Birth"}
                    editable={editable}
                    onSave={val => updateLabel('dobLabel', val)}
                    className="inline-block"
                  />
                </span>
                <strong className="text-slate-800 font-bold block">{dob}</strong>
              </div>
            )}
            {columnsList.gender !== false && (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 shadow-2xs">
                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Gender</span>
                <strong className="text-slate-800 font-bold block">Male</strong>
              </div>
            )}
            {!!columnsList.mobileNumber && (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 shadow-2xs">
                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Mobile</span>
                <strong className="text-slate-800 font-bold block">{phone || '9876543210'}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Modern Academic Performance Table */}
        <div className="mb-6">
          <div 
            className="text-white px-5 py-3 flex items-center justify-between text-xs font-black uppercase tracking-wider rounded-t-2xl shadow-2xs"
            style={{ backgroundColor: primary }}
          >
            <LiveEditableText
              value={labels.academicPerformanceHeading || 'Modern Academic Performance'}
              editable={editable}
              onSave={val => updateLabel('academicPerformanceHeading', val)}
              className="inline-block"
            />
            {columnsList.examName !== false && (
              <span className="text-white/90 font-semibold text-[11px]">
                <LiveEditableText
                  value={examName}
                  editable={editable}
                  onSave={val => onUpdateField?.('examName', val)}
                  className="inline-block"
                />
              </span>
            )}
          </div>
          {renderUniversalMarksTable('', undefined, true)}
        </div>

        {/* GPA & Percentage Pill Badges Card */}
        {renderOverallPerformanceCard('mb-6', true)}

        {/* Result Status Banner */}
        {columnsList.result !== false && (
          <div className="mb-6 p-3.5 bg-slate-50 border rounded-2xl flex items-center justify-between text-xs font-black shadow-xs" style={{ borderColor: borderTint }}>
            <span className="uppercase tracking-wider" style={{ color: primary }}>
              <LiveEditableText
                value={labels.aggregateGradeLabel || 'AGGREGATE RESULT: PASSED'}
                editable={editable}
                onSave={val => updateLabel('aggregateGradeLabel', val)}
                className="inline-block"
              />
            </span>
            <span className="px-3 py-1 rounded-full text-white text-[10px] font-black uppercase shadow-xs" style={{ backgroundColor: primary }}>
              Passed with Distinction
            </span>
          </div>
        )}

        {/* Signatures */}
        <div className="flex flex-wrap items-center justify-around gap-6 pt-4 border-t border-slate-100 text-center">
          {activeMarksheetSigns.map(s => (
            <div key={s.key} className="flex flex-col items-center min-w-[70px]">
              <div 
                className="h-8 flex items-end justify-center border-b border-dashed border-slate-400 pb-1"
                style={{ width: `${signatureWidth}px`, maxWidth: '100%' }}
              />
              <span 
                className="font-black uppercase text-slate-500 mt-1 block"
                style={{ fontSize: signatureFontSize ? `${signatureFontSize}px` : undefined }}
              >
                <LiveEditableText
                  value={s.title}
                  editable={editable}
                  onSave={val => updateLabel(s.labelKey, val)}
                  className="inline-block"
                  style={{ fontSize: signatureFontSize ? `${signatureFontSize}px` : undefined }}
                />
              </span>
            </div>
          ))}
        </div>

        {/* Footer Sub-Bar: Date of Issue & Big Verification QR */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
          {columnsList.dateOfIssue !== false ? (
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500">Date of Issue:</span>
              <span className="font-mono font-bold text-[10.5px] text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                <LiveEditableText
                  value={dateOfIssue || new Date().toLocaleDateString('en-GB')}
                  editable={editable}
                  onSave={val => onUpdateField?.('dateOfIssue', val)}
                  className="inline-block"
                />
              </span>
            </div>
          ) : <div />}

          {columnsList.qrCode !== false && (
            <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs select-none flex items-center justify-center shrink-0">
              <ProperQrCode size={Number(qrCodeSize) || 72} color={primary} className="shrink-0" />
            </div>
          )}
        </div>

        {/* Absolute Bottom: Grade Point & Performance Scales */}
        {renderScalesFooter("mt-3.5", true)}
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
              {renderInteractiveLogo("", true)}
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide" style={{ color: primary, fontSize: headerNameFontSize ? `${headerNameFontSize}px` : undefined }}>
                <LiveEditableText
                  tag="span"
                  value={schoolName}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolName', val)}
                  style={{ fontSize: headerNameFontSize ? `${headerNameFontSize}px` : undefined }}
                  fontSizeControl={{
                    label: 'School Name',
                    value: headerNameFontSize ? parseInt(headerNameFontSize) : 22,
                    onChange: val => onUpdateField?.('headerNameFontSize', val)
                  }}
                  className="inline-block"
                />
              </h1>
            </div>
            {columnsList.schoolAffiliation !== false && (
              <p className="text-xs font-bold text-slate-600 tracking-wider uppercase mt-1" style={{ fontSize: headerDetailsFontSize ? `${headerDetailsFontSize}px` : undefined }}>
                <LiveEditableText
                  value={affiliateTo || 'Affiliated to CBSE, New Delhi • Affiliation No. 2130842'}
                  editable={editable}
                  onSave={val => onUpdateField?.('affiliateTo', val)}
                  style={{ fontSize: headerDetailsFontSize ? `${headerDetailsFontSize}px` : undefined }}
                  fontSizeControl={{
                    label: 'Affiliation & Code',
                    value: headerDetailsFontSize ? parseFloat(headerDetailsFontSize) : 11,
                    onChange: val => onUpdateField?.('headerDetailsFontSize', val)
                  }}
                  className="inline-block"
                /> • {labels.schoolCodeLabel || 'SCHOOL CODE:'}{' '}
                <LiveEditableText
                  value={schoolCode || '123456'}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolCode', val)}
                  className="inline-block font-mono"
                />
              </p>
            )}
            <div 
              className="inline-block mt-2 px-6 py-1 text-white font-sans font-black text-xs uppercase tracking-widest rounded-sm shadow-xs"
              style={{ backgroundColor: primary, fontSize: headingFontSize ? `${headingFontSize}px` : undefined }}
            >
              <LiveEditableText
                value={headingHeader || 'ANNUAL ACADEMIC MARK SHEET'}
                editable={editable}
                onSave={val => onUpdateField?.('headingHeader', val)}
                style={{ fontSize: headingFontSize ? `${headingFontSize}px` : undefined }}
                fontSizeControl={{
                  label: 'Report Title',
                  value: headingFontSize ? parseInt(headingFontSize) : 14,
                  onChange: val => onUpdateField?.('headingFontSize', val)
                }}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 py-3.5 border-b text-xs font-sans" style={{ borderColor: borderTint }}>
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
            {columnsList.fatherName !== false && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">
                  <LiveEditableText
                    value={labels.fatherNameLabel || "Father's Name:"}
                    editable={editable}
                    onSave={val => updateLabel('fatherNameLabel', val)}
                    className="inline-block"
                  />
                </span>
                <strong className="text-slate-900">{fatherName}</strong>
              </div>
            )}
            {columnsList.motherName !== false && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">
                  <LiveEditableText
                    value={labels.motherNameLabel || "Mother's Name:"}
                    editable={editable}
                    onSave={val => updateLabel('motherNameLabel', val)}
                    className="inline-block"
                  />
                </span>
                <strong className="text-slate-900">{motherName}</strong>
              </div>
            )}
            {columnsList.dob !== false && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">
                  <LiveEditableText
                    value={labels.dobLabel || 'DOB:'}
                    editable={editable}
                    onSave={val => updateLabel('dobLabel', val)}
                    className="inline-block"
                  />
                </span>
                <strong className="text-slate-900">{dob}</strong>
              </div>
            )}
            {columnsList.gender !== false && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Gender:</span>
                <strong className="text-slate-900">Male</strong>
              </div>
            )}
            {columnsList.attendance !== false && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">
                  <LiveEditableText
                    value={labels.attendanceLabel || 'Attendance:'}
                    editable={editable}
                    onSave={val => updateLabel('attendanceLabel', val)}
                    className="inline-block"
                  />
                </span>
                <strong className="text-slate-900">{attendance || '96% (175/182)'}</strong>
              </div>
            )}
            {!!columnsList.mobileNumber && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Mobile:</span>
                <strong className="text-slate-900">{phone || '9876543210'}</strong>
              </div>
            )}
            {columnsList.examName !== false && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Exam:</span>
                <strong className="text-slate-900">{examName}</strong>
              </div>
            )}
          </div>

          {/* Academic Evaluation Table */}
          <div className="my-4">
            <div 
              className="text-white text-center py-2 font-sans font-black text-xs uppercase tracking-wider rounded-t-sm shadow-2xs"
              style={{ backgroundColor: primary }}
            >
              <LiveEditableText
                value={labels.consolidatedHeading || 'CONSOLIDATED ACADEMIC PERFORMANCE'}
                editable={editable}
                onSave={val => updateLabel('consolidatedHeading', val)}
                className="inline-block"
              />
            </div>
            {renderUniversalMarksTable()}
          </div>

          {/* Overall Performance Card (Percentage, CGPA, Grade, Final Marks) */}
          {renderOverallPerformanceCard('my-4', false)}

          {/* Result & Assessment Banner */}
          <div className="my-4 font-sans space-y-2 w-full">
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
                {columnsList.result !== false && (
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

          {/* 4 Signatures */}
          <div className="flex flex-wrap items-center justify-around gap-4 pt-6 mt-4 border-t-2 text-center font-sans text-[10px]" style={{ borderColor: primary }}>
            {activeMarksheetSigns.map(s => (
              <div key={s.key} className="min-w-[70px] flex flex-col items-center">
                <div 
                  className="h-8 border-b border-dashed border-slate-400 flex items-end justify-center pb-0.5"
                  style={{ width: `${signatureWidth}px`, maxWidth: '100%' }}
                />
                <span 
                  className="font-black uppercase text-slate-600 block mt-1"
                  style={{ fontSize: signatureFontSize ? `${signatureFontSize}px` : undefined }}
                >
                  <LiveEditableText
                    value={s.title}
                    editable={editable}
                    onSave={val => updateLabel(s.labelKey, val)}
                    className="inline-block"
                    style={{ fontSize: signatureFontSize ? `${signatureFontSize}px` : undefined }}
                  />
                </span>
              </div>
            ))}
          </div>

          {/* Date of Issue & QR Footer Sub-Bar */}
          <div className="pt-3 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {columnsList.dateOfIssue !== false ? (
              <div className="flex items-center gap-1.5 select-none">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500">Date of Issue:</span>
                <span className="font-mono font-bold text-[10.5px] text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <LiveEditableText
                    value={dateOfIssue || new Date().toLocaleDateString('en-GB')}
                    editable={editable}
                    onSave={val => onUpdateField?.('dateOfIssue', val)}
                    className="inline-block"
                  />
                </span>
              </div>
            ) : <div />}

            {columnsList.qrCode !== false && (
              <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs select-none flex items-center justify-center shrink-0">
                <ProperQrCode size={Number(qrCodeSize) || 72} color={primary} className="shrink-0" />
              </div>
            )}
          </div>

          {/* Absolute Bottom: Grade Point & Performance Scales */}
          {renderScalesFooter("mt-3.5")}

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
          {renderInteractiveLogo("mx-auto mb-2.5")}
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
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight" style={{ color: primary, fontSize: headingFontSize ? `${headingFontSize}px` : undefined }}>
            <LiveEditableText
              tag="span"
              value={labels.holisticHeading || 'HOLISTIC SKILLS & DEVELOPMENTAL PROGRESS REPORT'}
              editable={editable}
              onSave={val => updateLabel('holisticHeading', val)}
              style={{ fontSize: headingFontSize ? `${headingFontSize}px` : undefined }}
              fontSizeControl={{
                label: 'Report Title',
                value: headingFontSize ? parseInt(headingFontSize) : 16,
                onChange: val => onUpdateField?.('headingFontSize', val)
              }}
              className="inline-block"
            />
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1" style={{ fontSize: headerNameFontSize ? `${headerNameFontSize}px` : undefined }}>
            <LiveEditableText
              value={schoolName}
              editable={editable}
              onSave={val => onUpdateField?.('schoolName', val)}
              style={{ fontSize: headerNameFontSize ? `${headerNameFontSize}px` : undefined }}
              fontSizeControl={{
                label: 'School Name',
                value: headerNameFontSize ? parseInt(headerNameFontSize) : 18,
                onChange: val => onUpdateField?.('headerNameFontSize', val)
              }}
              className="inline-block"
            /> • Primary & Kindergarten Section
          </p>
          {columnsList.schoolAffiliation !== false && (
            <p className="text-[11px] font-bold text-slate-500 mt-1">
              <LiveEditableText
                value={affiliateTo || 'Affiliated to CBSE, New Delhi'}
                editable={editable}
                onSave={val => onUpdateField?.('affiliateTo', val)}
                className="inline-block"
              /> • {labels.schoolCodeLabel || 'School Code:'}{' '}
              <LiveEditableText
                value={schoolCode || '123456'}
                editable={editable}
                onSave={val => onUpdateField?.('schoolCode', val)}
                className="inline-block font-mono"
              />
            </p>
          )}
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
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-600 mt-1">
                {columnsList.classSection !== false && (
                  <span>
                    <LiveEditableText
                      value={labels.classLabel || 'Class:'}
                      editable={editable}
                      onSave={val => updateLabel('classLabel', val)}
                      className="inline-block mr-1"
                    />
                    <strong style={{ color: primary }}>{className} {sectionName ? `(${sectionName})` : ''}</strong>
                  </span>
                )}
                {columnsList.rollNumber !== false && (
                  <span>Roll: <strong className="text-slate-900">{rollNo}</strong></span>
                )}
                {columnsList.fatherName !== false && (
                  <span>Father: <strong className="text-slate-900">{fatherName}</strong></span>
                )}
                {columnsList.motherName !== false && (
                  <span>Mother: <strong className="text-slate-900">{motherName}</strong></span>
                )}
                {columnsList.dob !== false && (
                  <span>DOB: <strong className="text-slate-900">{dob}</strong></span>
                )}
                {columnsList.gender !== false && (
                  <span>Gender: <strong className="text-slate-900">Male</strong></span>
                )}
                {!!columnsList.mobileNumber && (
                  <span>Mobile: <strong className="text-slate-900">{phone || '9876543210'}</strong></span>
                )}
                {columnsList.examName !== false && (
                  <span>Exam: <strong className="text-slate-900">{examName}</strong></span>
                )}
                <span>
                  <LiveEditableText
                    value={labels.teacherLabel || 'Teacher:'}
                    editable={editable}
                    onSave={val => updateLabel('teacherLabel', val)}
                    className="inline-block mr-1 text-slate-400"
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
            {columnsList.rank !== false && (
              <div className="px-3.5 py-1.5 rounded-2xl text-center font-bold border" style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
                <span className="text-[8.5px] uppercase block opacity-80" style={{ color: '#b45309' }}>
                  <LiveEditableText
                    value={labels.classRankBadge || 'Rank'}
                    editable={editable}
                    onSave={val => updateLabel('classRankBadge', val)}
                    className="inline-block"
                  />
                </span>
                <span className="text-base font-black">{classRank}</span>
              </div>
            )}

            {/* Proper QR Code Verification Card */}
            {columnsList.qrCode !== false && (
              <div className="p-1 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs bg-white" style={{ borderColor: borderTint }}>
                <ProperQrCode size={Number(qrCodeSize) || 68} color={primary} className="shrink-0" />
              </div>
            )}
          </div>
        </div>

        {/* Academic Subject Performance Table */}
        <div className="my-6">
          <div 
            className="text-white px-5 py-2.5 flex items-center justify-between text-xs font-black uppercase tracking-wider rounded-t-2xl shadow-2xs"
            style={{ backgroundColor: primary }}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-300 fill-blue-300" />
              <span>Academic Performance Evaluation</span>
            </div>
            {columnsList.examName !== false && (
              <span className="text-white/90 font-semibold text-[11px]">{examName}</span>
            )}
          </div>
          {renderUniversalMarksTable('', undefined, true)}
        </div>

        {/* Overall Performance Card (Percentage, CGPA, Grade, Final Marks) */}
        {renderOverallPerformanceCard('my-4', true)}

        {/* Developmental Result Status Banner */}
        {columnsList.result !== false && (
          <div 
            className="my-4 p-3 rounded-2xl text-center font-black text-xs uppercase tracking-wider text-white shadow-xs"
            style={{ backgroundColor: primary }}
          >
            <LiveEditableText
              value={labels.holisticResultBanner || 'DEVELOPMENTAL RESULT: PROMOTED TO HIGHER GRADE WITH DISTINCTION ★★★'}
              editable={editable}
              onSave={val => updateLabel('holisticResultBanner', val)}
              className="inline-block"
            />
          </div>
        )}

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
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Phonics & Reading</span>
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★☆</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>B+</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Creative Writing</span>
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
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
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Counting & Sorting</span>
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★☆</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>B+</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Problem Solving</span>
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
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
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Music & Movement</span>
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>Outstanding</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Dramatic Play</span>
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
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
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Listening to Instructions</span>
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★☆</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>B+</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Gross & Fine Motor</span>
                <div className="flex items-center gap-1.5"><span className="text-blue-500 text-xs">★★★★★</span><span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: tintLight, color: primary, borderColor: borderTint }}>A</span></div>
              </div>
            </div>
          </div>

        </div>



        {/* Parent Feedback & Signature */}
        <div className="pt-4 border-t-2 flex flex-wrap items-center justify-around gap-6 text-center text-xs" style={{ borderColor: borderTint }}>
          {activeMarksheetSigns.map(s => (
            <div key={s.key} className="flex flex-col items-center min-w-[70px]">
              <div 
                className={`h-8 border-b border-slate-300 italic text-slate-700 flex items-end justify-center pb-0.5 ${
                  s.cursiveFont ? 'font-cursive text-sm' : 'font-serif text-sm'
                }`}
                style={{ width: `${signatureWidth}px`, maxWidth: '100%' }}
              >
                {s.name}
              </div>
              <span 
                className="font-bold uppercase text-slate-500 mt-1 block"
                style={{ fontSize: signatureFontSize ? `${signatureFontSize}px` : undefined }}
              >
                <LiveEditableText
                  value={s.title}
                  editable={editable}
                  onSave={val => updateLabel(s.labelKey, val)}
                  className="inline-block"
                  style={{ fontSize: signatureFontSize ? `${signatureFontSize}px` : undefined }}
                />
              </span>
            </div>
          ))}
        </div>

        {/* Date of Issue & Official QR Verification Badge */}
        <div className="pt-3 flex items-center justify-between">
          {columnsList.dateOfIssue !== false ? (
            <div className="text-[10px] font-bold text-slate-500">
              Date of Issue:{' '}
              <LiveEditableText
                value={dateOfIssue || new Date().toLocaleDateString('en-GB')}
                editable={editable}
                onSave={val => onUpdateField?.('dateOfIssue', val)}
                className="text-slate-800 font-mono inline-block"
              />
            </div>
          ) : <div />}

          {/* Official Verification QR Badge */}
          {columnsList.qrCode !== false && (
            <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs select-none flex items-center justify-center shrink-0">
              <ProperQrCode size={Number(qrCodeSize) || 72} color={primary} className="shrink-0" />
            </div>
          )}
        </div>

        {/* Absolute Bottom: Grade Point & Performance Scales */}
        {renderScalesFooter("mt-3.5", true)}

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
            {renderInteractiveLogo("", true)}
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight" style={{ color: primary }}>
                <LiveEditableText
                  tag="span"
                  value={schoolName}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolName', val)}
                  style={{ fontSize: headerNameFontSize ? `${headerNameFontSize}px` : undefined }}
                  fontSizeControl={{
                    label: 'School Name',
                    value: headerNameFontSize ? parseInt(headerNameFontSize) : 22,
                    onChange: val => onUpdateField?.('headerNameFontSize', val)
                  }}
                  className="inline-block"
                />
              </h1>
              {columnsList.schoolAffiliation !== false && (
                <p className="text-[11px] font-bold mt-0.5" style={{ color: primary, fontSize: headerDetailsFontSize ? `${headerDetailsFontSize}px` : undefined }}>
                  <LiveEditableText
                    value={affiliateTo || 'Affiliated to CBSE, New Delhi • Affiliation No. 2130842'}
                    editable={editable}
                    onSave={val => onUpdateField?.('affiliateTo', val)}
                    style={{ fontSize: headerDetailsFontSize ? `${headerDetailsFontSize}px` : undefined }}
                    fontSizeControl={{
                      label: 'Affiliation & Code',
                      value: headerDetailsFontSize ? parseFloat(headerDetailsFontSize) : 11,
                      onChange: val => onUpdateField?.('headerDetailsFontSize', val)
                    }}
                    className="inline-block"
                  /> • {labels.schoolCodeLabel || 'SCHOOL CODE:'}{' '}
                  <LiveEditableText
                    value={schoolCode || '123456'}
                    editable={editable}
                    onSave={val => onUpdateField?.('schoolCode', val)}
                    className="inline-block font-mono"
                  />
                </p>
              )}
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
              borderColor: borderTint,
              fontSize: headingFontSize ? `${headingFontSize}px` : undefined
            }}
          >
            <LiveEditableText
              value={headingHeader || 'ANNUAL PROGRESS REPORT CARD'}
              editable={editable}
              onSave={val => onUpdateField?.('headingHeader', val)}
              style={{ fontSize: headingFontSize ? `${headingFontSize}px` : undefined }}
              fontSizeControl={{
                label: 'Report Title',
                value: headingFontSize ? parseInt(headingFontSize) : 14,
                onChange: val => onUpdateField?.('headingFontSize', val)
              }}
              className="inline-block"
            />
          </div>
          <div className="text-[11px] font-black mt-1.5 uppercase tracking-wide" style={{ color: primary }}>
            {columnsList.examName !== false && examName && (
              <>
                <span className="font-bold text-slate-800">
                  <LiveEditableText
                    value={examName}
                    editable={editable}
                    onSave={val => onUpdateField?.('examName', val)}
                    className="inline-block mr-1"
                  />
                </span>
                <span>• </span>
              </>
            )}
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
          {columnsList.gender !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Gender</span>
              <span className="font-semibold text-slate-700">Male</span>
            </div>
          )}
          {!!columnsList.mobileNumber && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Mobile</span>
              <span className="font-semibold text-slate-700">{phone || '9876543210'}</span>
            </div>
          )}
          {columnsList.rank !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                <LiveEditableText
                  value={labels.classRankLabel || 'Class Rank'}
                  editable={editable}
                  onSave={val => updateLabel('classRankLabel', val)}
                  className="inline-block"
                />
              </span>
              <span className="font-bold text-blue-700">{classRank}</span>
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
              value={labels.part1Heading || 'SCHOLASTIC AREAS'}
              editable={editable}
              onSave={val => updateLabel('part1Heading', val)}
              className="inline-block"
            />
          </div>
          {renderUniversalMarksTable()}
        </div>

        {/* Overall Performance Card (Percentage, CGPA, Grade, Final Marks) */}
        {renderOverallPerformanceCard('my-4', false)}

        {/* Result Status Banner */}
        {columnsList.result !== false && (
          <div className="my-4 border rounded-lg overflow-hidden p-3.5 flex items-center justify-center shadow-2xs" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
            <div className="text-[11px] font-black uppercase text-center" style={{ color: primary }}>
              <LiveEditableText
                value={labels.aggregateGradeLabel || 'AGGREGATE GRADE: A1 • RESULT: PASSED'}
                editable={editable}
                onSave={val => updateLabel('aggregateGradeLabel', val)}
                className="inline-block"
              />
            </div>
          </div>
        )}

        {/* Official Signatures & Verification Footer */}
        <div className="pt-6 mt-5 border-t-2 space-y-5" style={{ borderColor: primary }}>
          {/* Signatures Row: Clean horizontal line, always aligned at baseline */}
          <div className="flex flex-wrap items-end justify-between gap-4 text-center">
            {activeMarksheetSigns.map(s => (
              <div 
                key={s.key} 
                className="flex-1 flex flex-col items-center min-w-[70px]"
                style={{ maxWidth: `${Math.max(Number(signatureWidth) || 110, 180)}px` }}
              >
                <div 
                  className="border-b border-dashed border-slate-400 mb-1.5 pb-1 flex items-end justify-center min-h-[22px]"
                  style={{ width: `${signatureWidth}px`, maxWidth: '100%' }}
                />
                <span 
                  className="font-black uppercase text-slate-600 tracking-wider block"
                  style={{ fontSize: signatureFontSize ? `${signatureFontSize}px` : undefined }}
                >
                  <LiveEditableText
                    value={s.title}
                    editable={editable}
                    onSave={val => updateLabel(s.labelKey, val)}
                    className="inline-block"
                    style={{ fontSize: signatureFontSize ? `${signatureFontSize}px` : undefined }}
                  />
                </span>
              </div>
            ))}
          </div>

          {/* Footer Sub-Bar: Clean Issue Date & Verified Official QR Badge */}
          <div className="pt-3 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Left: Date of Issue */}
            {columnsList.dateOfIssue !== false ? (
              <div className="flex items-center gap-1.5 select-none">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500">Date of Issue:</span>
                <span className="font-mono font-bold text-[10.5px] text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <LiveEditableText
                    value={dateOfIssue || new Date().toLocaleDateString('en-GB')}
                    editable={editable}
                    onSave={val => onUpdateField?.('dateOfIssue', val)}
                    className="inline-block"
                  />
                </span>
              </div>
            ) : <div />}

            {/* Right: Official Verification QR Badge */}
            {columnsList.qrCode !== false && (
              <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs select-none flex items-center justify-center shrink-0">
                <ProperQrCode size={Number(qrCodeSize) || 72} color={primary} className="shrink-0" />
              </div>
            )}
          </div>

          {/* Absolute Bottom: Grade Point & Performance Scales */}
          {renderScalesFooter("mt-3.5")}
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
          ? 'shadow-md ring-2 ring-blue-500/50 scale-[1.01]'
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
                <div className="text-[5px] text-blue-800 font-bold leading-none">Affiliated to CBSE • Code: 123456</div>
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

          {/* Signatures */}
          <div className="flex justify-between items-center pt-0.5 text-[4.5px] font-black uppercase text-slate-500 border-t" style={{ borderColor: borderTint }}>
            <span>Class Teacher</span>
            <span>Exam In-Charge</span>
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
          className="w-full h-full p-1.5 flex flex-col justify-between bg-gradient-to-b from-sky-50/80 via-white to-blue-50/60 text-slate-800 rounded-lg border-2"
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
              <Star className="w-2.5 h-2.5 fill-blue-400 text-blue-500 shrink-0" />
              <span className="text-[7.5px] font-black uppercase tracking-tight truncate max-w-[120px]" style={{ color: primary }}>
                {schoolName}
              </span>
              <Star className="w-2.5 h-2.5 fill-blue-400 text-blue-500 shrink-0" />
            </div>
            <div className="text-[5px] font-bold text-slate-500 uppercase">
              HOLISTIC SKILLS & DEVELOPMENT PROGRESS
            </div>
          </div>

          {/* Child Ribbon */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-dashed shadow-2xs" style={{ borderColor: borderTint }}>
            <div className="w-5 h-5 rounded-full border flex items-center justify-center bg-blue-50 shrink-0" style={{ borderColor: primary }}>
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
              <span className="text-blue-500 font-bold shrink-0">★★★★★</span>
            </div>
            <div className="p-0.5 rounded bg-white border flex justify-between items-center" style={{ borderColor: borderTint }}>
              <span className="font-bold text-slate-700 truncate">Language & Literacy</span>
              <span className="text-blue-500 font-bold shrink-0">★★★★★</span>
            </div>
            <div className="p-0.5 rounded bg-white border flex justify-between items-center" style={{ borderColor: borderTint }}>
              <span className="font-bold text-slate-700 truncate">Creative Expression</span>
              <span className="text-blue-500 font-bold shrink-0">★★★★☆</span>
            </div>
            <div className="p-0.5 rounded bg-white border flex justify-between items-center" style={{ borderColor: borderTint }}>
              <span className="font-bold text-slate-700 truncate">Social & Emotional</span>
              <span className="text-blue-500 font-bold shrink-0">★★★★★</span>
            </div>
          </div>

          {/* Teacher Smiley Footer */}
          <div className="flex justify-between items-center text-[4.5px] font-bold text-slate-600 pt-0.5 border-t" style={{ borderColor: borderTint }}>
            <span className="text-blue-600">🌟 Teacher: "Inquisitive & joyful learner!"</span>
            <span className="font-black" style={{ color: primary }}>Class Teacher & Principal</span>
          </div>
        </div>
      )}
    </div>
  )
}


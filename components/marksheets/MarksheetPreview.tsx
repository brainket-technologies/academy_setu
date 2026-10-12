'use client'

import React from 'react'
import { Award, CheckCircle2, ShieldCheck, QrCode, Sparkles, School } from 'lucide-react'

export interface MarksheetPreviewProps {
  templateName?: string
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
  templateName = 'Purple Classic',
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  affiliateTo = 'Affiliated to CBSE, New Delhi • Affiliation No. 2130842',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi - 110092',
  schoolCode = '123456',
  phone = '+91 11 2345 6789',
  email = 'info@cosmopolitan.edu',
  principalName = 'Dr. Meenakshi Sundaram',
  academicYear = '2025-2026',
  examName = 'Half Yearly Examination 2025-26',
  headingHeader = 'REPORT CARD • ACADEMIC EVALUATION',
  className = 'Class 10',
  sectionName = 'Section A',
  studentName = 'Aarav Sharma',
  rollNo = '1001',
  admissionNo = 'AS-2024-1048',
  fatherName = 'Rajesh Sharma',
  motherName = 'Sunita Sharma',
  dob = '14/08/2010',
  attendance = '188 / 200 Days (94%)',
  subjects = [
    { subjectName: 'English Core', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '92', grade: 'A+' },
    { subjectName: 'Mathematics', maxMarks: '100', practicalColumn: false, practicalMarks: '', obtainedMarks: '96', grade: 'A+' },
    { subjectName: 'General Science', maxMarks: '100', practicalColumn: true, practicalMarks: '30', obtainedMarks: '90', grade: 'A+' },
    { subjectName: 'Social Science', maxMarks: '100', practicalColumn: false, practicalMarks: '', obtainedMarks: '88', grade: 'A' },
    { subjectName: 'Hindi Course A', maxMarks: '100', practicalColumn: false, practicalMarks: '', obtainedMarks: '85', grade: 'A' },
    { subjectName: 'Information Technology', maxMarks: '100', practicalColumn: true, practicalMarks: '40', obtainedMarks: '98', grade: 'A+' }
  ],
  percentRanges = [
    { range: '85-100', remark: 'Distinction' },
    { range: '75-84', remark: 'Very Good' },
    { range: '60-74', remark: 'Good' },
    { range: '33-59', remark: 'Satisfactory' }
  ],
  gradeRanges = [
    { range: '91-100', grade: 'A+' },
    { range: '81-90', grade: 'A' },
    { range: '71-80', grade: 'B+' },
    { range: '61-70', grade: 'B' },
    { range: '33-60', grade: 'C' }
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
  // Ensure we have subjects to display
  const activeSubjects = subjects && subjects.length > 0 ? subjects : [
    { subjectName: 'English Core', maxMarks: '100', practicalColumn: true, practicalMarks: '20', obtainedMarks: '90', grade: 'A+' },
    { subjectName: 'Mathematics', maxMarks: '100', practicalColumn: false, practicalMarks: '', obtainedMarks: '95', grade: 'A+' },
    { subjectName: 'Science', maxMarks: '100', practicalColumn: true, practicalMarks: '30', obtainedMarks: '88', grade: 'A' },
    { subjectName: 'Social Science', maxMarks: '100', practicalColumn: false, practicalMarks: '', obtainedMarks: '85', grade: 'A' }
  ]

  // Calculate totals
  const totalMax = activeSubjects.reduce((acc, s) => acc + (Number(s.maxMarks) || 100), 0)
  const totalObt = activeSubjects.reduce((acc, s) => acc + (Number(s.obtainedMarks) || 88), 0)
  const percentage = ((totalObt / totalMax) * 100).toFixed(2)

  // Color theme mapping based on templateName
  const isMaroon = templateName.toLowerCase().includes('maroon') || templateName.toLowerCase().includes('scholastic')
  const isIndigo = templateName.toLowerCase().includes('indigo') || templateName.toLowerCase().includes('skills') || templateName.toLowerCase().includes('grid')
  const isClassicNavy = templateName.toLowerCase().includes('navy')

  // Theme colors
  const primaryColor = isMaroon ? '#7f1d1d' : isIndigo ? '#1e3a8a' : isClassicNavy ? '#0f172a' : '#581c87'
  const secondaryColor = isMaroon ? '#991b1b' : isIndigo ? '#2563eb' : isClassicNavy ? '#1e293b' : '#6b21a8'
  const lightBg = isMaroon ? '#fef2f2' : isIndigo ? '#eff6ff' : isClassicNavy ? '#f8fafc' : '#faf5ff'
  const borderCol = isMaroon ? '#fca5a5' : isIndigo ? '#bfdbfe' : isClassicNavy ? '#cbd5e1' : '#e9d5ff'
  const accentBadge = isMaroon ? 'bg-red-900 text-red-50' : isIndigo ? 'bg-blue-900 text-blue-50' : isClassicNavy ? 'bg-slate-900 text-slate-50' : 'bg-purple-900 text-purple-50'

  return (
    <div 
      className="w-full bg-white text-slate-900 rounded-sm shadow-xl p-7 md:p-9 font-sans border-8 transition-all select-none"
      style={{ borderColor: primaryColor }}
    >
      {/* Decorative Outer Border */}
      <div 
        className="border-2 p-5 md:p-7 relative"
        style={{ borderColor: borderCol }}
      >
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-5 border-b-2" style={{ borderColor: primaryColor }}>
          
          {/* School Emblem / Logo */}
          <div className="flex items-center gap-3.5">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <School className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight" style={{ color: primaryColor }}>
                {schoolName}
              </h1>
              <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                {affiliateTo} • School Code: {schoolCode}
              </p>
              <p className="text-[10px] text-slate-500">
                {schoolAddress} | Ph: {phone}
              </p>
            </div>
          </div>

          {/* Student Photo */}
          {showStudentPhoto && (
            <div className="flex flex-col items-center shrink-0">
              <div 
                className={`w-16 h-20 bg-slate-100 border-2 overflow-hidden flex items-center justify-center shadow-xs ${
                  showRoundBorderPhoto ? 'rounded-xl' : 'rounded-xs'
                }`}
                style={{ borderColor: primaryColor }}
              >
                {/* Simulated photo avatar */}
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

        {/* Report Card Title Ribbon */}
        <div className="my-4 text-center">
          <div 
            className="inline-block px-8 py-1.5 rounded-full text-white font-black text-xs md:text-sm tracking-wider uppercase shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            {headingHeader || 'ACADEMIC PERFORMANCE REPORT'}
          </div>
          <div className="text-[11px] font-black text-slate-700 mt-1 uppercase tracking-wide">
            {examName} • SESSION {academicYear}
          </div>
        </div>

        {/* Student Details Grid */}
        <div 
          className="rounded-xl p-4 my-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border"
          style={{ backgroundColor: lightBg, borderColor: borderCol }}
        >
          {columnsList.admissionNo !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Admission / Reg No</span>
              <span className="font-mono font-bold text-slate-800">{admissionNo}</span>
            </div>
          )}

          {columnsList.rollNumber !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Roll Number</span>
              <span className="font-mono font-bold text-slate-800">{rollNo}</span>
            </div>
          )}

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Student's Name</span>
            <span className="font-black text-slate-900 text-sm">{studentName}</span>
          </div>

          {columnsList.classSection !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Class & Section</span>
              <span className="font-bold text-slate-800">{className} {sectionName ? `(${sectionName})` : ''}</span>
            </div>
          )}

          {columnsList.fatherName !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Father's Name</span>
              <span className="font-semibold text-slate-700">{fatherName}</span>
            </div>
          )}

          {columnsList.motherName !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Mother's Name</span>
              <span className="font-semibold text-slate-700">{motherName}</span>
            </div>
          )}

          {columnsList.dob !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Date of Birth</span>
              <span className="font-semibold text-slate-700">{dob}</span>
            </div>
          )}

          {columnsList.attendance !== false && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Attendance</span>
              <span className="font-semibold text-slate-700">{attendance}</span>
            </div>
          )}
        </div>

        {/* Subjects & Marks Table */}
        <div className="overflow-x-auto rounded-xl border my-4" style={{ borderColor: borderCol }}>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-white font-black uppercase text-[11px]" style={{ backgroundColor: secondaryColor }}>
                <th className="px-3.5 py-2.5">S.No</th>
                <th className="px-3.5 py-2.5">Subject</th>
                <th className="px-3.5 py-2.5 text-center">Max Marks</th>
                {showTestMarks && (
                  <>
                    <th className="px-3.5 py-2.5 text-center">Theory / W.T.</th>
                    <th className="px-3.5 py-2.5 text-center">Practical / Int.</th>
                  </>
                )}
                <th className="px-3.5 py-2.5 text-center">Marks Obtained</th>
                <th className="px-3.5 py-2.5 text-center">Subject Grade</th>
                <th className="px-3.5 py-2.5 text-center">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeSubjects.map((sub, i) => {
                const max = Number(sub.maxMarks) || 100
                const obt = Number(sub.obtainedMarks) || Math.floor(82 + (i * 3) % 16)
                const pracMax = sub.practicalColumn ? (Number(sub.practicalMarks) || 20) : 0
                const theoryObt = obt - (pracMax > 0 ? Math.floor(pracMax * 0.9) : 0)
                const pracObt = pracMax > 0 ? Math.floor(pracMax * 0.9) : '-'
                const grade = sub.grade || (obt >= 90 ? 'A+' : obt >= 80 ? 'A' : obt >= 70 ? 'B+' : 'B')

                return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="px-3.5 py-2 font-mono text-slate-400">{i + 1}.</td>
                    <td className="px-3.5 py-2 font-bold text-slate-800">{sub.subjectName}</td>
                    <td className="px-3.5 py-2 text-center font-semibold text-slate-600">{max}</td>
                    {showTestMarks && (
                      <>
                        <td className="px-3.5 py-2 text-center text-slate-600">{theoryObt}</td>
                        <td className="px-3.5 py-2 text-center text-slate-600">{pracObt}</td>
                      </>
                    )}
                    <td className="px-3.5 py-2 text-center font-black text-slate-900">{obt}</td>
                    <td className="px-3.5 py-2 text-center">
                      <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {grade}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-center text-[10px] font-semibold text-emerald-700">
                      {obt >= 90 ? 'Exemplary' : 'Good'}
                    </td>
                  </tr>
                )
              })}

              {/* Total Aggregate Row */}
              <tr className="font-black text-xs border-t-2" style={{ backgroundColor: lightBg, borderColor: primaryColor }}>
                <td colSpan={2} className="px-3.5 py-2.5 uppercase tracking-wide" style={{ color: primaryColor }}>
                  Grand Total / Aggregate
                </td>
                <td className="px-3.5 py-2.5 text-center font-mono">{totalMax}</td>
                {showTestMarks && (
                  <>
                    <td className="px-3.5 py-2.5 text-center">-</td>
                    <td className="px-3.5 py-2.5 text-center">-</td>
                  </>
                )}
                <td className="px-3.5 py-2.5 text-center text-sm font-black text-emerald-700">
                  {totalObt} / {totalMax}
                </td>
                <td className="px-3.5 py-2.5 text-center text-xs font-black" style={{ color: primaryColor }}>
                  {percentage >= '90' ? 'A+' : 'A'}
                </td>
                <td className="px-3.5 py-2.5 text-center font-bold text-emerald-700">
                  PASSED
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Badges: Percentage, Rank, Division, Result */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="border border-slate-200 rounded-xl p-2.5 text-center bg-slate-50">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Percentage</span>
            <span className="text-base font-black text-slate-900">{percentage}%</span>
          </div>
          <div className="border border-slate-200 rounded-xl p-2.5 text-center bg-slate-50">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Class Rank</span>
            <span className="text-base font-black text-blue-700">1st / 45</span>
          </div>
          <div className="border border-slate-200 rounded-xl p-2.5 text-center bg-slate-50">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Division</span>
            <span className="text-xs font-black text-emerald-700 block mt-1">1st with Distinction</span>
          </div>
          <div className="border border-slate-200 rounded-xl p-2.5 text-center bg-slate-50">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Final Result</span>
            <span className="text-sm font-black text-emerald-600 block mt-0.5">QUALIFIED / PASSED</span>
          </div>
        </div>

        {/* Grading Scale Legend */}
        <div className="rounded-xl border border-slate-200 p-3 bg-white text-[10px] text-slate-600 my-4">
          <div className="font-bold uppercase text-slate-700 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Grading Scale Reference
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono">
            {gradeRanges.map((g, idx) => (
              <span key={idx}><strong>{g.grade}:</strong> {g.range}%</span>
            ))}
          </div>
        </div>

        {/* Signatures & Verification Footer */}
        <div className="pt-8 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6 text-center text-xs">
          
          {/* Class Teacher Signature */}
          <div className="flex flex-col items-center">
            <div className="w-36 border-b border-slate-400 mb-1 pb-1 text-[11px] font-cursive italic text-slate-500">
              Preeti Saxena
            </div>
            <span className="text-[10px] font-black uppercase text-slate-600">Class Teacher</span>
          </div>

          {/* Institutional Stamp / QR */}
          {showHeaderStamp && (
            <div className="flex flex-col items-center select-none">
              <div 
                className="w-16 h-16 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1 text-[7.5px] font-black uppercase text-center shadow-xs"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Award className="w-4 h-4 mb-0.5" />
                <span>OFFICIAL</span>
                <span>SEAL</span>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-mono">DATE: {new Date().toLocaleDateString('en-GB')}</span>
            </div>
          )}

          {/* Principal Signature */}
          <div className="flex flex-col items-center">
            {showHeaderSign && (
              <div className="w-40 border-b border-slate-400 mb-1 pb-1 text-[11px] font-serif font-black italic text-slate-700">
                {principalName}
              </div>
            )}
            <span className="text-[10px] font-black uppercase text-slate-600">Principal / Headmaster</span>
          </div>
        </div>

      </div>
    </div>
  )
}

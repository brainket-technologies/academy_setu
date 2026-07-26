import React from 'react'
import { QrCode, Award } from 'lucide-react'

interface MarksheetData {
  studentName?: string
  rollNo?: string
  className?: string
  section?: string
  examName?: string
  session?: string
  obtainedMarks?: number
  totalMarks?: number
  rank?: number
}

// --------------------------------------------------------------------------------
// Template 1: Purple Classic Summary (Screenshot 2)
// --------------------------------------------------------------------------------
export const MarksheetDesign1: React.FC<{ data?: MarksheetData }> = ({ data = {} }) => {
  const {
    studentName = 'Arjun Kumar',
    rollNo = '042',
    className = 'Class VIII',
    section = 'Section B',
    examName = 'Progress Card 2025-26',
    session = '2025-26',
    obtainedMarks = 560,
    totalMarks = 1000,
    rank = 1
  } = data

  const subjects = [
    { name: 'Social Studies', obt: 30, fe: 30, hy: 30, fy: 30, total: 120, max: 200, grade: 'C+' },
    { name: 'Mathematics', obt: 30, fe: 30, hy: 30, fy: 30, total: 120, max: 200, grade: 'C+' },
    { name: 'Computer', obt: 25, fe: 25, hy: 25, fy: 25, total: 100, max: 200, grade: 'C' },
    { name: 'Hindi', obt: 30, fe: 30, hy: 30, fy: 30, total: 120, max: 200, grade: 'C+' },
    { name: 'English', obt: 25, fe: 25, hy: 25, fy: 25, total: 100, max: 200, grade: 'C' },
  ]

  const totalObt = subjects.reduce((sum, s) => sum + s.total, 0)
  const totalMax = subjects.reduce((sum, s) => sum + s.max, 0)
  const percentage = ((totalObt / totalMax) * 100).toFixed(2)
  const performance = Number(percentage) >= 75 ? 'Excellent' : Number(percentage) >= 50 ? 'Satisfactory' : 'Need Attention'

  return (
    <div className="w-[780px] bg-white text-slate-800 p-6 flex flex-col font-sans shrink-0 border-2 border-slate-300 relative shadow-md select-none">
      
      {/* Deep Purple Header */}
      <div className="bg-[#4c2472] text-white p-4 flex justify-between items-center relative rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
            <div className="w-12 h-12 bg-[#4c2472] rounded-full"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide uppercase">School Name</h1>
            <p className="text-sm font-semibold tracking-wider opacity-95">Address</p>
            <div className="flex gap-4 text-[9px] font-bold opacity-80 mt-1">
              <span>Affiliated To: CBSE Board</span>
              <span>Affiliation No.: 123456</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-1 rounded shrink-0">
          <QrCode className="w-12 h-12 text-[#4c2472]" />
        </div>
      </div>

      {/* Session / Title Info Row */}
      <div className="grid grid-cols-3 text-center border-x border-b border-slate-200 text-[11px] font-black bg-slate-50 uppercase text-slate-700 py-2.5">
        <div>Session : {session}</div>
        <div className="text-teal-700 tracking-wider font-extrabold">{examName}</div>
        <div>Date : 12/03/2026</div>
      </div>

      {/* Student Details Grid */}
      <div className="flex gap-4 items-center border-x border-b border-slate-200 p-4 bg-white text-xs">
        {/* Photo Box */}
        <div className="w-20 h-24 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0">
          Photo
        </div>

        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2">
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Student Name:</span><span className="font-extrabold text-slate-800">{studentName}</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Father Name:</span><span className="font-extrabold text-slate-850">{data.studentName ? 'Anuj Kumar' : 'Anuj Kumar'}</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Class & Section:</span><span className="font-extrabold text-slate-800">{className}, {section}</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Mobile No.:</span><span className="font-extrabold text-slate-800">9999999999</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Admission No.:</span><span className="font-extrabold text-slate-800">{rollNo}</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Roll No.:</span><span className="font-extrabold text-slate-800">{rollNo}</span></div>
          <div className="flex col-span-2"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Date of Birth:</span><span className="font-extrabold text-slate-800">10-08-2022</span></div>
        </div>
      </div>

      {/* Subject Grades & Right Badges Split */}
      <div className="flex border-x border-slate-200 relative z-10">
        
        {/* Table Left */}
        <div className="flex-1">
          <table className="w-full text-[10px] text-center border-collapse border-b border-slate-200">
            <thead>
              <tr className="bg-[#4c2472] text-white font-extrabold border-b border-[#4c2472]">
                <th className="px-2 py-2 text-left text-[9px] uppercase tracking-wider pl-4">Subject</th>
                <th className="px-2 py-2 border-l border-white/20">Obtain Marks</th>
                <th className="px-2 py-2 border-l border-white/20">Final Exam</th>
                <th className="px-2 py-2 border-l border-white/20">Half Yearly</th>
                <th className="px-2 py-2 border-l border-white/20">Final Year</th>
                <th className="px-2 py-2 border-l border-white/20">Obtained Marks</th>
                <th className="px-2 py-2 border-l border-white/20">Total Marks</th>
                <th className="px-2 py-2 border-l border-white/20">Grade</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, i) => (
                <tr key={i} className="border-b border-slate-200/60 font-bold text-slate-700 hover:bg-slate-50/50">
                  <td className="px-2 py-2 text-left pl-4 font-black text-slate-800 border-r border-slate-200/50">{sub.name}</td>
                  <td className="px-2 py-2 border-r border-slate-200/50">{sub.fe}</td>
                  <td className="px-2 py-2 border-r border-slate-200/50">{sub.fe}</td>
                  <td className="px-2 py-2 border-r border-slate-200/50">{sub.hy}</td>
                  <td className="px-2 py-2 border-r border-slate-200/50">{sub.fy}</td>
                  <td className="px-2 py-2 font-black text-slate-900 border-r border-slate-200/50">{sub.total}</td>
                  <td className="px-2 py-2 text-slate-500 border-r border-slate-200/50">{sub.max}</td>
                  <td className="px-2 py-2 text-teal-600 font-extrabold">{sub.grade}</td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="bg-slate-50 font-black text-slate-800 uppercase text-[9px] border-t border-slate-350">
                <td className="px-2 py-2.5 text-left pl-4 border-r border-slate-200">Total</td>
                <td className="px-2 py-2.5 border-r border-slate-200">140</td>
                <td className="px-2 py-2.5 border-r border-slate-200">140</td>
                <td className="px-2 py-2.5 border-r border-slate-200">140</td>
                <td className="px-2 py-2.5 border-r border-slate-200">140</td>
                <td className="px-2 py-2.5 font-black text-[#4c2472] border-r border-slate-200">{totalObt}</td>
                <td className="px-2 py-2.5 text-slate-500 border-r border-slate-200">{totalMax}</td>
                <td className="px-2 py-2.5 text-[#4c2472] font-black">C+</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Badges Column block */}
        <div className="w-36 bg-[#4c2472] text-white flex flex-col justify-between text-center select-none border-l border-[#4c2472]">
          <div className="p-3 border-b border-white/10 flex-1 flex flex-col justify-center items-center">
            <span className="text-[8px] font-bold tracking-wider opacity-85 uppercase block mb-1">Result</span>
            <span className="text-sm font-black uppercase tracking-widest text-emerald-400">Pass</span>
          </div>

          <div className="p-3 border-b border-white/10 flex-1 flex flex-col justify-center items-center">
            <span className="text-[8px] font-bold tracking-wider opacity-85 uppercase block mb-1">Percentage</span>
            <span className="text-sm font-black">{percentage}%</span>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-center items-center">
            <span className="text-[8px] font-bold tracking-wider opacity-85 uppercase block mb-1">Performance</span>
            <span className="text-xs font-bold text-amber-300">{performance}</span>
          </div>
        </div>

      </div>

      {/* Grade and remarks guidelines tables */}
      <div className="grid grid-cols-2 border-x border-b border-slate-200 p-4 gap-4 text-[9px]">
        {/* Left Side: Subject Grade Range */}
        <div className="border border-slate-250 rounded-lg overflow-hidden">
          <div className="bg-[#4c2472] text-white text-center font-bold py-1.5 uppercase tracking-wide text-[8px]">
            Subject Grade Range
          </div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500">
                <th className="py-1">91-100</th>
                <th className="py-1 border-l border-slate-200">81-90</th>
                <th className="py-1 border-l border-slate-200">71-80</th>
                <th className="py-1 border-l border-slate-200">61-70</th>
                <th className="py-1 border-l border-slate-200">51-60</th>
                <th className="py-1 border-l border-slate-200">41-50</th>
                <th className="py-1 border-l border-slate-200">33-40</th>
                <th className="py-1 border-l border-slate-200">0-32</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-extrabold text-slate-700">
                <td className="py-1">A+</td>
                <td className="py-1 border-l border-slate-200">A</td>
                <td className="py-1 border-l border-slate-200">B+</td>
                <td className="py-1 border-l border-slate-200">B+</td>
                <td className="py-1 border-l border-slate-200">C+</td>
                <td className="py-1 border-l border-slate-200">C</td>
                <td className="py-1 border-l border-slate-200">D</td>
                <td className="py-1 border-l border-slate-200">F</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Side: Percentage Remarks Range */}
        <div className="border border-slate-250 rounded-lg overflow-hidden">
          <div className="bg-[#4c2472] text-white text-center font-bold py-1.5 uppercase tracking-wide text-[8px]">
            Percentage Remarks Range
          </div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500">
                <th className="py-1">85-100</th>
                <th className="py-1 border-l border-slate-200">76-84</th>
                <th className="py-1 border-l border-slate-200">60-75</th>
                <th className="py-1 border-l border-slate-200">40-59</th>
                <th className="py-1 border-l border-slate-200">33-39</th>
                <th className="py-1 border-l border-slate-200">0-32</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-extrabold text-slate-700">
                <td className="py-1">Excellent</td>
                <td className="py-1 border-l border-slate-200">Very Good</td>
                <td className="py-1 border-l border-slate-200">Good</td>
                <td className="py-1 border-l border-slate-200">Satisfactory</td>
                <td className="py-1 border-l border-slate-200">Need Attention</td>
                <td className="py-1 border-l border-slate-200">Very Poor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance report (Screenshot 2) */}
      <div className="border-x border-b border-slate-200 p-4 text-[9px] bg-white">
        <div className="border border-slate-250 rounded-lg overflow-hidden">
          <div className="bg-[#4c2472] text-white text-center font-bold py-1.5 uppercase tracking-wide text-[8px]">
            Attendance Report 2025-26
          </div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500">
                <th className="py-1">Month</th>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                  <th key={m} className="py-1 border-l border-slate-200">{m}</th>
                ))}
                <th className="py-1 border-l border-slate-200">Total</th>
                <th className="py-1 border-l border-slate-200">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold text-slate-700">
                <td className="py-1 bg-slate-50 font-extrabold text-slate-600">Total Present</td>
                {Array(12).fill(20).map((v, idx) => (
                  <td key={idx} className="py-1 border-l border-slate-200">{v}</td>
                ))}
                <td className="py-1 border-l border-slate-200 font-extrabold text-slate-800">240</td>
                <td className="py-1 border-l border-slate-200 font-black text-teal-600">72%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signatures rows */}
      <div className="grid grid-cols-4 gap-4 border-x border-b border-slate-200 p-6 text-center text-[9px] font-black uppercase text-slate-500 bg-white">
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Issued Date</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Parents Signature</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Class Teacher Signature</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Principal Signature</span>
        </div>
      </div>

      {/* Instructions footer text */}
      <div className="border-x border-b border-slate-200 p-4 text-[7px] text-slate-400 bg-slate-50/50 italic space-y-1">
        <div>Instruction: 1- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
        <div>2- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
      </div>

      {/* Deep purple Contact Info bottom band */}
      <div className="bg-[#4c2472] text-white p-3 flex justify-between items-center rounded-b-lg text-[9px] font-semibold">
        <span>Contact Info : 9999999999</span>
        <span>Email : schoolname@gmail.com</span>
        <span>Website : schoolname.com</span>
      </div>

    </div>
  )
}

// --------------------------------------------------------------------------------
// Template 2: Scholastic / Co-Scholastic Term Split (Screenshot 3)
// --------------------------------------------------------------------------------
export const MarksheetDesign2: React.FC<{ data?: MarksheetData }> = ({ data = {} }) => {
  const {
    studentName = 'Arjun Kumar',
    rollNo = '042',
    className = 'Class VIII',
    section = 'Section B',
    examName = 'Progress Card 2025-26',
    session = '2025-26',
    obtainedMarks = 830,
    totalMarks = 1000,
    rank = 2
  } = data

  const subjects = [
    { name: 'Social Studies', pt2: 9, ae: 40, t2: 49, pt1: 30, hy: 80, sa1: 9, t1: 119, overall: 168 },
    { name: 'Mathematics', pt2: 8, ae: 55, t2: 63, pt1: 30, hy: 75, sa1: 8, t1: 113, overall: 176 },
    { name: 'Computer', pt2: 7, ae: 72, t2: 80, pt1: 25, hy: 46, sa1: 7, t1: 78, overall: 158 },
    { name: 'Hindi', pt2: 5, ae: 56, t2: 61, pt1: 30, hy: 52, sa1: 5, t1: 87, overall: 148 },
    { name: 'English', pt2: 8, ae: 61, t2: 69, pt1: 25, hy: 78, sa1: 8, t1: 111, overall: 180 },
  ]

  const nonAcList = [
    { activity: 'GK', grade: 'B' },
    { activity: 'English (Communicative)', grade: 'C' },
    { activity: 'English (Language & Literature)', grade: 'A' },
    { activity: 'Hindi Written', grade: 'B' },
    { activity: 'Maths', grade: 'A' },
  ]

  return (
    <div className="w-[780px] bg-white text-slate-800 p-6 flex flex-col font-sans shrink-0 border-2 border-slate-350 relative shadow-md select-none">
      
      {/* Maroon Header */}
      <div className="bg-[#660033] text-white p-4 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
            <div className="w-12 h-12 bg-[#660033] rounded-full"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide uppercase">School Name</h1>
            <p className="text-sm font-semibold opacity-95">Address</p>
            <div className="flex gap-4 text-[9px] font-bold opacity-85 mt-1">
              <span>Affiliated To : CBSE Board</span>
              <span>Affilation No. : 123456</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-1 rounded shrink-0">
          <QrCode className="w-12 h-12 text-[#660033]" />
        </div>
      </div>

      {/* Date and session bar */}
      <div className="grid grid-cols-3 text-center border-x border-b border-slate-200 text-[11px] font-black bg-slate-50 uppercase text-slate-700 py-2.5">
        <div>Session : {session}</div>
        <div className="text-red-800 tracking-wider font-extrabold">{examName}</div>
        <div>Date : 12/03/2026</div>
      </div>

      {/* Student details */}
      <div className="flex gap-4 items-center border-x border-b border-slate-200 p-4 bg-white text-xs">
        <div className="w-20 h-24 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0">
          Photo
        </div>

        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2">
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Student Name:</span><span className="font-extrabold text-slate-800">{studentName}</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Father Name:</span><span className="font-extrabold text-slate-800">Anuj Kumar</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Class & Section:</span><span className="font-extrabold text-slate-800">{className}, {section}</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Mobile No.:</span><span className="font-extrabold text-slate-800">9999999999</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Admission No.:</span><span className="font-extrabold text-slate-800">{rollNo}</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Roll No.:</span><span className="font-extrabold text-slate-800">{rollNo}</span></div>
          <div className="flex col-span-2"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Date of Birth:</span><span className="font-extrabold text-slate-800">10-08-2022</span></div>
        </div>
      </div>

      {/* Scholastic Area (Academic) Header */}
      <div className="bg-[#660033] text-white text-center text-[10px] font-black uppercase py-2 tracking-wider border-x border-[#660033]">
        Scholastic Area (Academic)
      </div>

      {/* Table grid */}
      <div className="border-x border-slate-200">
        <table className="w-full text-center text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-50 font-bold border-b border-slate-250 text-slate-600">
              <th className="py-2 px-2 text-left pl-4 rowspan-2 border-r border-slate-200" rowSpan={2}>Subject</th>
              <th className="py-1 border-r border-slate-200" colSpan={3}>Term 2</th>
              <th className="py-1 border-r border-slate-200" colSpan={4}>Term 1</th>
              <th className="py-2 px-2 border-b border-slate-200" rowSpan={2}>Obtained Marks</th>
            </tr>
            <tr className="bg-slate-50 font-bold border-b border-slate-250 text-[9px] text-slate-500">
              <th className="py-1 border-r border-slate-200">PT2 (10)</th>
              <th className="py-1 border-r border-slate-200">Annual Exam (75)</th>
              <th className="py-1 border-r border-slate-200">Total (85)</th>
              <th className="py-1 border-r border-slate-200">PT1 (40)</th>
              <th className="py-1 border-r border-slate-200">Half Yearly (100)</th>
              <th className="py-1 border-r border-slate-200">SA-1 (10)</th>
              <th className="py-1 border-r border-slate-200">Total (150)</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, i) => (
              <tr key={i} className="border-b border-slate-200/60 font-bold text-slate-700">
                <td className="py-2 text-left pl-4 font-black text-slate-800 border-r border-slate-200">{sub.name}</td>
                <td className="py-2 border-r border-slate-200">{sub.pt2}</td>
                <td className="py-2 border-r border-slate-200">{sub.ae}</td>
                <td className="py-2 font-semibold text-[#660033] border-r border-slate-200">{sub.t2}</td>
                <td className="py-2 border-r border-slate-200">{sub.pt1}</td>
                <td className="py-2 border-r border-slate-200">{sub.hy}</td>
                <td className="py-2 border-r border-slate-200">{sub.sa1}</td>
                <td className="py-2 font-semibold text-[#660033] border-r border-slate-200">{sub.t1}</td>
                <td className="py-2 font-black text-slate-900">{sub.overall}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Metrics horizontal bar */}
      <div className="grid grid-cols-5 text-center border-x border-b border-slate-200 text-[10px] font-black uppercase text-slate-700 py-3 bg-slate-50">
        <div>Over All Marks : {obtainedMarks} / {totalMarks}</div>
        <div className="border-l border-slate-200">Percentage : 83.00%</div>
        <div className="border-l border-slate-200">Rank : {rank}</div>
        <div className="border-l border-slate-200">Grade : A2</div>
        <div className="border-l border-slate-200">Performance : B</div>
      </div>

      {/* Co-Scholastic Area Header */}
      <div className="bg-[#660033] text-white text-center text-[10px] font-black uppercase py-2 tracking-wider border-x border-[#660033] mt-4">
        Co-Scholastic Activities (Non Academic)
      </div>

      {/* Co-scholastic table */}
      <div className="border-x border-b border-slate-200">
        <table className="w-full text-center text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-50 font-bold border-b border-slate-250 text-slate-600">
              <th className="py-2 text-left pl-4 border-r border-slate-200">Activity</th>
              <th className="py-2">Grade</th>
            </tr>
          </thead>
          <tbody>
            {nonAcList.map((item, i) => (
              <tr key={i} className="border-b border-slate-150 last:border-0 font-bold text-slate-700">
                <td className="py-2 text-left pl-4 border-r border-slate-200 font-black text-slate-700">{item.activity}</td>
                <td className="py-2 font-black text-teal-600">{item.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 8 and 3 Point Grading scale grid */}
      <div className="grid grid-cols-2 gap-4 border-x border-b border-slate-200 p-4 text-[9px] bg-slate-50">
        <div className="border border-slate-250 rounded-lg overflow-hidden bg-white">
          <div className="bg-[#660033] text-white text-center font-bold py-1 uppercase text-[8px]">
            8 Point Grading Scale
          </div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500">
                <th className="py-1">91-100</th>
                <th className="py-1 border-l border-slate-200">81-90</th>
                <th className="py-1 border-l border-slate-200">71-80</th>
                <th className="py-1 border-l border-slate-200">61-70</th>
                <th className="py-1 border-l border-slate-200">51-60</th>
                <th className="py-1 border-l border-slate-200">41-50</th>
                <th className="py-1 border-l border-slate-200">33-40</th>
                <th className="py-1 border-l border-slate-200">0-32</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-extrabold text-slate-700">
                <td className="py-1">A1</td>
                <td className="py-1 border-l border-slate-200">A2</td>
                <td className="py-1 border-l border-slate-200">B1</td>
                <td className="py-1 border-l border-slate-200">B2</td>
                <td className="py-1 border-l border-slate-200">C1</td>
                <td className="py-1 border-l border-slate-200">C2</td>
                <td className="py-1 border-l border-slate-200">D</td>
                <td className="py-1 border-l border-slate-200">E1</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border border-slate-250 rounded-lg overflow-hidden bg-white">
          <div className="bg-[#660033] text-white text-center font-bold py-1 uppercase text-[8px]">
            3 Point Grading Scale
          </div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500">
                <th className="py-1">75%-100%</th>
                <th className="py-1 border-l border-slate-200">81%-90%</th>
                <th className="py-1 border-l border-slate-200">45%-73%</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-extrabold text-slate-700">
                <td className="py-1">A</td>
                <td className="py-1 border-l border-slate-200">B</td>
                <td className="py-1 border-l border-slate-200">C</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature area */}
      <div className="grid grid-cols-4 gap-4 border-x border-b border-slate-200 p-6 text-center text-[9px] font-black uppercase text-slate-500 bg-white">
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Issued Date</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Parents Signature</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Class Teacher Signature</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Principal Signature</span>
        </div>
      </div>

      {/* Instructions footer text */}
      <div className="border-x border-b border-slate-200 p-4 text-[7px] text-slate-400 bg-slate-50/50 italic space-y-1">
        <div>Instruction: 1- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
        <div>2- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
      </div>

      {/* Maroon Footer info band */}
      <div className="bg-[#660033] text-white p-3 flex justify-between items-center rounded-b-lg text-[9px] font-semibold">
        <span>Contact Info : 9999999999</span>
        <span>Email : schoolname@gmail.com</span>
        <span>Website : schoolname.com</span>
      </div>

    </div>
  )
}

// --------------------------------------------------------------------------------
// Template 3: Skills-Based Aspect Grid (Screenshot 4)
// --------------------------------------------------------------------------------
export const MarksheetDesign3: React.FC<{ data?: MarksheetData }> = ({ data = {} }) => {
  const {
    studentName = 'Arjun Kumar',
    rollNo = '042',
    className = 'Class VIII',
    section = 'Section B',
    examName = 'Progress Card 2025-26',
    session = '2025-26'
  } = data

  const leftScholastic = [
    { subject: 'English', aspect: 'Reading Skill (Conversation, Recitation)', e1: 'A', e2: 'A' },
    { subject: '', aspect: 'Listening Skill (Pronunciation, Fluency, Comprehension)', e1: 'B+', e2: 'B+' },
    { subject: '', aspect: 'Speaking Skill (Conversation, Recitation)', e1: 'B', e2: 'A+' },
    { subject: '', aspect: 'Writing Skill (Creative Writing, Handwriting, Grammar, Spelling, Vocabulary)', e1: 'A', e2: 'B' },
    { subject: '', aspect: 'Listening Skill (Pronunciation)', e1: 'B', e2: 'A' },
    { subject: 'Hindi', aspect: 'Reading Skill', e1: 'B+', e2: 'A' },
    { subject: '', aspect: 'Speaking Skill', e1: 'C+', e2: 'C+' },
    { subject: '', aspect: 'Writing Skill', e1: 'B+', e2: 'B+' },
    { subject: 'General Awareness', aspect: 'Good Habits', e1: 'B+', e2: 'A' },
    { subject: '', aspect: 'General Awareness', e1: 'C+', e2: 'C+' },
    { subject: '', aspect: 'Social Skills', e1: 'B+', e2: 'B+' },
    { subject: 'Maths', aspect: 'Writing Skill', e1: 'B+', e2: 'A' },
    { subject: '', aspect: 'Speaking Skill', e1: 'C+', e2: 'C+' },
  ]

  const rightNonScholastic = [
    { subject: 'indoor', aspect: 'Dance', e1: 'B+', e2: 'A' },
    { subject: '', aspect: 'Art', e1: 'C+', e2: 'C+' },
    { subject: '', aspect: 'Music', e1: 'B+', e2: 'B+' },
    { subject: 'Physical Education', aspect: 'Physical Education (Motor Skills, Running, Jumping, Galloping, Throwing, Catching, Long Jump)', e1: 'B+', e2: 'A' },
    { subject: 'Outdoor', aspect: 'Games (Enthusiasm, Discipline, Talent)', e1: 'C+', e2: 'C+' },
  ]

  return (
    <div className="w-[780px] bg-white text-slate-800 p-6 flex flex-col font-sans shrink-0 border-2 border-slate-350 relative shadow-md select-none">
      
      {/* Indigo Header */}
      <div className="bg-[#1b3a60] text-white p-4 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
            <div className="w-12 h-12 bg-[#1b3a60] rounded-full"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide uppercase">School Name</h1>
            <p className="text-sm font-semibold opacity-95">Address</p>
            <div className="flex gap-4 text-[9px] font-bold opacity-85 mt-1">
              <span>Affiliated To: CBSE Board</span>
              <span>Affiliation No.: 123456</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-1 rounded shrink-0">
          <QrCode className="w-12 h-12 text-[#1b3a60]" />
        </div>
      </div>

      {/* Session / Date Row */}
      <div className="grid grid-cols-3 text-center border-x border-b border-slate-200 text-[11px] font-black bg-slate-50 uppercase text-slate-700 py-2.5">
        <div>Session : {session}</div>
        <div className="text-blue-800 tracking-wider font-extrabold">{examName}</div>
        <div>Date : 12/03/2026</div>
      </div>

      {/* Student Details Grid */}
      <div className="flex gap-4 items-center border-x border-b border-slate-200 p-4 bg-white text-xs">
        <div className="w-20 h-24 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0">
          Photo
        </div>

        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2">
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Student Name:</span><span className="font-extrabold text-slate-800">{studentName}</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Father Name:</span><span className="font-extrabold text-slate-800">Anuj Kumar</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Class & Section:</span><span className="font-extrabold text-slate-800">{className}, {section}</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Mobile No.:</span><span className="font-extrabold text-slate-800">9999999999</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Admission No.:</span><span className="font-extrabold text-slate-800">{rollNo}</span></div>
          <div className="flex"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Roll No.:</span><span className="font-extrabold text-slate-800">{rollNo}</span></div>
          <div className="flex col-span-2"><span className="w-28 text-slate-400 font-bold uppercase text-[9px]">Date of Birth:</span><span className="font-extrabold text-slate-800">10-08-2022</span></div>
        </div>
      </div>

      {/* Main Split Grid (Scholastic vs Co-Scholastic) */}
      <div className="grid grid-cols-2 border-x border-slate-200 gap-x-2 bg-white">
        
        {/* Left Side: Scholastic Areas */}
        <div className="border-r border-slate-200">
          <div className="bg-[#1b3a60] text-white text-center text-[9px] font-black uppercase py-1.5 tracking-wide">
            Scholastic Areas
          </div>
          <table className="w-full text-center text-[9px] border-collapse border-b border-slate-200">
            <thead>
              <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500">
                <th className="py-1.5 px-2 text-left pl-3">Subject</th>
                <th className="py-1.5 border-l border-slate-200 text-left px-2">Aspects</th>
                <th className="py-1.5 border-l border-slate-200 w-8">E1</th>
                <th className="py-1.5 border-l border-slate-200 w-8">E2</th>
              </tr>
            </thead>
            <tbody>
              {leftScholastic.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 last:border-0 font-semibold text-slate-700">
                  <td className="py-1.5 px-2 text-left pl-3 font-black text-slate-800 border-r border-slate-200/50">{row.subject}</td>
                  <td className="py-1.5 border-r border-slate-200/50 text-left px-2 max-w-[200px] whitespace-normal leading-tight text-slate-500">{row.aspect}</td>
                  <td className="py-1.5 border-r border-slate-200/50 font-black text-teal-600">{row.e1}</td>
                  <td className="py-1.5 font-black text-teal-700">{row.e2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side: Co-Scholastic & Attendance */}
        <div className="space-y-4">
          <div>
            <div className="bg-[#1b3a60] text-white text-center text-[9px] font-black uppercase py-1.5 tracking-wide">
              Co-Scholastic Areas
            </div>
            <table className="w-full text-center text-[9px] border-collapse border-b border-slate-200">
              <thead>
                <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500">
                  <th className="py-1.5 px-2 text-left pl-3">Subject</th>
                  <th className="py-1.5 border-l border-slate-200 text-left px-2">Aspects</th>
                  <th className="py-1.5 border-l border-slate-200 w-8">E1</th>
                  <th className="py-1.5 border-l border-slate-200 w-8">E2</th>
                </tr>
              </thead>
              <tbody>
                {rightNonScholastic.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 font-semibold text-slate-700">
                    <td className="py-1.5 px-2 text-left pl-3 font-black text-slate-800 border-r border-slate-200/50">{row.subject}</td>
                    <td className="py-1.5 border-r border-slate-200/50 text-left px-2 max-w-[200px] whitespace-normal leading-tight text-slate-500">{row.aspect}</td>
                    <td className="py-1.5 border-r border-slate-200/50 font-black text-teal-600">{row.e1}</td>
                    <td className="py-1.5 font-black text-teal-700">{row.e2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Attendance block */}
          <div className="border border-slate-200 rounded-lg overflow-hidden mx-2">
            <div className="bg-[#1b3a60] text-white text-center font-bold py-1.5 uppercase text-[8px] tracking-wide">
              Attendance
            </div>
            <table className="w-full text-center text-[9px] border-collapse">
              <thead>
                <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500">
                  <th className="py-1">Total Open Days</th>
                  <th className="py-1 border-l border-slate-200">Total Present Days</th>
                  <th className="py-1 border-l border-slate-200">Attendance Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-extrabold text-slate-700">
                  <td className="py-1.5">180</td>
                  <td className="py-1.5 border-l border-slate-200">120</td>
                  <td className="py-1.5 border-l border-slate-200 text-teal-600 font-black">65%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remarks Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mx-2 text-[10px] font-bold text-slate-700 flex gap-2 items-center">
            <span className="text-slate-400 uppercase text-[9px]">Remark :</span>
            <span className="text-slate-800 italic">Good</span>
          </div>

        </div>

      </div>

      {/* Grade ranges scale list at bottom */}
      <div className="border-x border-b border-slate-200 p-4 text-[9px] bg-slate-50">
        <div className="border border-slate-250 rounded-lg overflow-hidden bg-white">
          <div className="bg-[#1b3a60] text-white text-center font-bold py-1 uppercase text-[8px]">
            Subject Grade Range
          </div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500">
                <th className="py-1">91-100</th>
                <th className="py-1 border-l border-slate-200">81-90</th>
                <th className="py-1 border-l border-slate-200">71-80</th>
                <th className="py-1 border-l border-slate-200">61-70</th>
                <th className="py-1 border-l border-slate-200">51-60</th>
                <th className="py-1 border-l border-slate-200">41-50</th>
                <th className="py-1 border-l border-slate-200">33-40</th>
                <th className="py-1 border-l border-slate-200">0-32</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-extrabold text-slate-700">
                <td className="py-1">A+</td>
                <td className="py-1 border-l border-slate-200">A</td>
                <td className="py-1 border-l border-slate-200">B+</td>
                <td className="py-1 border-l border-slate-200">B+</td>
                <td className="py-1 border-l border-slate-200">C+</td>
                <td className="py-1 border-l border-slate-200">C</td>
                <td className="py-1 border-l border-slate-200">D</td>
                <td className="py-1 border-l border-slate-200">F</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature boxes */}
      <div className="grid grid-cols-4 gap-4 border-x border-b border-slate-200 p-6 text-center text-[9px] font-black uppercase text-slate-500 bg-white">
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Issued Date</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Parents Signature</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Class Teacher Signature</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-8 border border-slate-200 rounded mb-1 bg-slate-50/50"></div>
          <span>Principal Signature</span>
        </div>
      </div>

      {/* Instructions footer text */}
      <div className="border-x border-b border-slate-200 p-4 text-[7px] text-slate-400 bg-slate-50/50 italic space-y-1">
        <div>Instruction: 1- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
        <div>2- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
      </div>

      {/* Indigo Footer info band */}
      <div className="bg-[#1b3a60] text-white p-3 flex justify-between items-center rounded-b-lg text-[9px] font-semibold">
        <span>Contact Info : 9999999999</span>
        <span>Email : schoolname@gmail.com</span>
        <span>Website : schoolname.com</span>
      </div>

    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Edit, Search, Upload, X, Calendar as CalendarIcon, Download, FileText, EyeOff, FileEdit, Folder } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Mock Data
const EMPLOYEES: Record<string, any> = {
  '1': {
    id: 1, username: 'abcd123', name: 'Employee Name',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir',
    designation: 'Manager', staffId: 'Emp123', joiningDate: '11/01/2025',
    contact: '9999999999', status: 'Active',
    aadhar: '12345678900', aadharFile: 'Aadhar Card.jpg',
    address: '123, Location, Street Name, Locality', pincode: '221545', district: 'Lucknow', state: 'Uttar Pradesh',
    casualLeave: 12, medicalLeave: 12, halfDayLeave: 6,
    nationality: 'Indian', religion: 'Hindu', category: 'General',
    maritalStatus: 'Married',
    quals: [
      { qual: 'Graduation', year: '2002', marks: '273', pct: '52%', college: 'abcd College', doc: 'Certificate.jpg' },
      { qual: 'Intermediate', year: '2000', marks: '273', pct: '52%', college: 'abcd College', doc: 'Certificate.jpg' }
    ],
    additionalQuals: [
      { course: 'O Level Computer Course', year: '2013', doc: 'Certificate 1.jpg' }
    ],
    experience: [
      { school: 'abcd college', designation: 'Mathematics Teacher', from: '04-07-2014', to: '31-07-2015' },
      { school: 'abcd college', designation: 'Mathematics Teacher', from: '12-06-2015', to: '11-12-2016' }
    ],
    basicSalary: '12,500', hra: '2,000', conveyance: '1,500', specialAllowance: '4,000', grossSalary: '20,000',
    accountName: 'Alok Tiwari', accountNo: '1203214568', ifsc: 'BANK123456', bankName: 'abcd Bank', panNo: 'PAN12345678',
    upiId: 'abcd@okindian', uan: '123456789', pfNo: '123456789'
  }
}

// Components
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200">{title}</h3>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">
          <FileEdit className="w-3.5 h-3.5" /> Edit
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function GridInfo({ data }: { data: { label: string; value: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <span className="text-xs font-bold text-slate-500 min-w-[120px]">{item.label}</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function TableBlock({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600">
          <tr>
            {headers.map(h => <th key={h} className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

// Tabs
function EmployeeDetailsTab({ employee }: { employee: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Aadhar Details">
          <GridInfo data={[
            { label: 'Aadhar Card No.', value: employee.aadhar },
            { label: 'Aadhar Card', value: <span className="text-teal-600 text-xs flex items-center gap-1"><EyeOff className="w-3.5 h-3.5"/> {employee.aadharFile}</span> }
          ]} />
        </SectionCard>
        <SectionCard title="Address Details">
          <GridInfo data={[
            { label: 'Address', value: employee.address },
            { label: 'Pincode', value: employee.pincode },
            { label: 'District', value: employee.district },
            { label: 'State', value: employee.state }
          ]} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Leave Details">
          <GridInfo data={[
            { label: 'Casual Leave', value: employee.casualLeave },
            { label: 'Medical Leave', value: employee.medicalLeave },
            { label: 'Half Day Leave', value: employee.halfDayLeave }
          ]} />
        </SectionCard>
        <SectionCard title="Religion & Category">
          <GridInfo data={[
            { label: 'Nationality', value: employee.nationality },
            { label: 'Religion', value: employee.religion },
            { label: 'Category', value: employee.category }
          ]} />
        </SectionCard>
        <SectionCard title="Marital Status">
          <GridInfo data={[
            { label: 'Status', value: employee.maritalStatus }
          ]} />
        </SectionCard>
      </div>

      <SectionCard title="Qualification Details">
        <TableBlock headers={['Qualification', 'Pass. Year', 'Obt. Marks', 'Percentage', 'College Name', 'Document']}>
          {employee.quals.map((q: any, i: number) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3"><span className="px-3 py-1 rounded border border-slate-300 text-xs">{q.qual}</span></td>
              <td className="px-4 py-3"><span className="px-3 py-1 rounded border border-slate-300 text-xs">{q.year}</span></td>
              <td className="px-4 py-3"><span className="px-3 py-1 rounded border border-slate-300 text-xs">{q.marks}</span></td>
              <td className="px-4 py-3"><span className="px-3 py-1 rounded border border-slate-300 text-xs">{q.pct}</span></td>
              <td className="px-4 py-3"><span className="px-3 py-1 rounded border border-slate-300 text-xs">{q.college}</span></td>
              <td className="px-4 py-3 text-teal-600 text-xs flex items-center gap-1 mt-2"><EyeOff className="w-3.5 h-3.5"/> {q.doc}</td>
            </tr>
          ))}
        </TableBlock>
      </SectionCard>

      <SectionCard title="Additional Qualification">
        <TableBlock headers={['Course / Certificate', 'Pass. Year', 'Document']}>
          {employee.additionalQuals.map((q: any, i: number) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3"><span className="px-3 py-1 rounded border border-slate-300 text-xs">{q.course}</span></td>
              <td className="px-4 py-3"><span className="px-3 py-1 rounded border border-slate-300 text-xs">{q.year}</span></td>
              <td className="px-4 py-3 text-slate-500 text-xs">{q.doc}</td>
            </tr>
          ))}
        </TableBlock>
      </SectionCard>

      <SectionCard title="Experience">
        <TableBlock headers={['School/Organization Name', 'Designation', 'From', 'To']}>
          {employee.experience.map((e: any, i: number) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3"><span className="px-3 py-1 rounded border border-slate-300 text-xs">{e.school}</span></td>
              <td className="px-4 py-3"><span className="px-3 py-1 rounded border border-slate-300 text-xs">{e.designation}</span></td>
              <td className="px-4 py-3"><span className="px-3 py-1 rounded border border-slate-300 text-xs">{e.from}</span></td>
              <td className="px-4 py-3"><span className="px-3 py-1 rounded border border-slate-300 text-xs">{e.to}</span></td>
            </tr>
          ))}
        </TableBlock>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Payroll Details">
          <GridInfo data={[
            { label: 'Basic Salary', value: employee.basicSalary },
            { label: 'HRA', value: employee.hra },
            { label: 'Conveyance', value: employee.conveyance },
            { label: 'Special Allowance', value: employee.specialAllowance },
            { label: 'Gross Monthly Salary', value: employee.grossSalary }
          ]} />
        </SectionCard>
        <SectionCard title="Bank Details">
          <GridInfo data={[
            { label: 'Account Holder Name', value: employee.accountName },
            { label: 'Account No.', value: employee.accountNo },
            { label: 'IFSC Code', value: employee.ifsc },
            { label: 'Bank Name', value: employee.bankName },
            { label: 'Pan No.', value: employee.panNo }
          ]} />
        </SectionCard>
        <div className="space-y-6">
          <SectionCard title="Online Payment Details">
            <GridInfo data={[ { label: 'UPI ID', value: employee.upiId } ]} />
          </SectionCard>
          <SectionCard title="Other Details">
            <GridInfo data={[
              { label: 'Universal Account No.', value: employee.uan },
              { label: 'PF Account No.', value: employee.pfNo }
            ]} />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

function AttendanceTab() {
  const summary = [
    { num: 227, label: 'total Present', col: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { num: 70, label: 'total Absent', col: 'text-red-500', bg: 'bg-red-50 border-red-200' },
    { num: 27, label: 'Half day', col: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { num: 28, label: 'total Late', col: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
    { num: 12, label: 'total Holiday', col: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  ]
  
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Attendance</h2>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-600">Select Session</span>
            <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white min-w-[150px]"><option>2025-2026</option></select>
          </div>
          <button className="mt-5 w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center"><Download className="w-4 h-4"/></button>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold mt-5">
          <span>Present : <span className="text-emerald-600">P</span></span>
          <span>Absent : <span className="text-red-500">A</span></span>
          <span>Holiday : <span className="text-purple-600">H</span></span>
          <span>Late : <span className="text-yellow-600">L</span></span>
          <span>Half Day : <span className="text-blue-600">F</span></span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-8">
        {summary.map((s, i) => (
          <div key={i} className={`flex-1 min-w-[120px] p-4 rounded-xl border ${s.bg} flex items-center justify-between`}>
            <div>
              <div className={`text-2xl font-black ${s.col}`}>{s.num}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{s.label}</div>
            </div>
            <div className={`w-8 h-8 rounded-full ${s.bg} border-0 flex items-center justify-center opacity-50`}>
              <CalendarIcon className={`w-4 h-4 ${s.col}`} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm p-4">
         <div className="min-w-[800px]">
           <div className="flex border-b border-slate-200 pb-3 mb-3 text-xs font-black text-slate-800">
             <div className="w-12">Month</div>
             {Array.from({length:31}).map((_,i) => <div key={i} className="flex-1 text-center">{i+1}</div>)}
           </div>
           {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
             <div key={m} className="flex py-2 text-xs font-bold border-b border-slate-50 last:border-0">
               <div className="w-12 text-slate-600">{m}</div>
               {Array.from({length:31}).map((_,i) => {
                 let val = 'P'; let col = 'text-emerald-500'
                 if (i === 3) { val = 'H'; col = 'text-purple-500' }
                 if (i === 10) { val = 'A'; col = 'text-red-500' }
                 if (i === 12) { val = 'L'; col = 'text-yellow-500' }
                 return <div key={i} className={`flex-1 text-center ${col}`}>{val}</div>
               })}
             </div>
           ))}
         </div>
      </div>
    </div>
  )
}

function LeaveTab() {
  const summary = [
    { num: 12, label: 'Casual Leave', sub: 'Used - 7, Available - 5', col: 'text-teal-600', bg: 'border-teal-100 bg-teal-50' },
    { num: 12, label: 'Medical Leave', sub: 'Used - 7, Available - 5', col: 'text-emerald-600', bg: 'border-emerald-100 bg-emerald-50' },
    { num: 8, label: 'Half Day', sub: 'Used - 3, Available - 5', col: 'text-pink-600', bg: 'border-pink-100 bg-pink-50' },
  ]
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap gap-4 mb-8">
        {summary.map((s, i) => (
          <div key={i} className={`flex-1 min-w-[200px] p-4 rounded-xl border shadow-sm flex items-center justify-between ${s.bg}`}>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">{s.label}</div>
              <div className={`text-3xl font-black ${s.col}`}>{s.num}</div>
              <div className="text-[10px] font-semibold text-slate-500 mt-1">{s.sub}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center">
              <CalendarIcon className={`w-5 h-5 ${s.col}`} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search" className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white min-w-[150px]"><option>2025-2026</option></select>
        <button className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center"><Download className="w-4 h-4"/></button>
      </div>
      
      <TableBlock headers={['S. No.', 'Leave Type', 'Date', 'Duration', 'Apply Date', 'Status']}>
        {[
          { no: 1, type: 'Medical Leave', date: '12/11/2025 - 13/11/2025', dur: '3', apply: '11/11/2025', status: 'Approved', col: 'text-emerald-600 bg-emerald-50' },
          { no: 2, type: 'Casual Leave', date: '12/11/2025 - 13/11/2025', dur: '3', apply: '11/11/2025', status: 'Pending', col: 'text-yellow-600 bg-yellow-50' },
          { no: 3, type: 'Special Leave', date: '12/11/2025 - 13/11/2025', dur: '3', apply: '11/11/2025', status: 'Approved', col: 'text-emerald-600 bg-emerald-50' },
        ].map(r => (
          <tr key={r.no} className="border-b border-slate-100 text-sm">
            <td className="px-4 py-3">{r.no}.</td>
            <td className="px-4 py-3 font-semibold text-slate-700">{r.type}</td>
            <td className="px-4 py-3 text-slate-500">{r.date}</td>
            <td className="px-4 py-3">{r.dur}</td>
            <td className="px-4 py-3 text-slate-500">{r.apply}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-1 rounded text-xs font-bold ${r.col}`}>● {r.status}</span>
            </td>
          </tr>
        ))}
      </TableBlock>
      <div className="flex items-center justify-between mt-4 text-xs font-medium text-slate-500">
        <span>Showing 1-3 of 3 Entries</span>
        <div className="flex gap-1">
          <button className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50">&laquo;</button>
          <button className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50">&lsaquo;</button>
          <button className="w-7 h-7 rounded flex items-center justify-center bg-teal-600 text-white">1</button>
          <button className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-teal-600">2</button>
          <button className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50">&rsaquo;</button>
          <button className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50">&raquo;</button>
        </div>
      </div>
    </div>
  )
}

function PayrollTab({ employee }: { employee: any }) {
  const summary = [
    { num: '20,000', label: 'Total Net Salary', col: 'text-emerald-500', bg: 'border-emerald-200' },
    { num: '5,000', label: 'Total Gross Salary', col: 'text-teal-500', bg: 'border-teal-200' },
    { num: '2,500', label: 'Total Deduction', col: 'text-red-500', bg: 'border-red-200' },
  ]
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap gap-4 mb-8">
        {summary.map((s, i) => (
          <div key={i} className={`flex-1 min-w-[200px] p-4 rounded-xl border shadow-sm flex items-center justify-between ${s.bg}`}>
            <div>
              <div className={`text-3xl font-black ${s.col}`}>{s.num}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">{s.label}</div>
            </div>
            <div className={`w-10 h-10 rounded-full border border-dashed flex items-center justify-center ${s.bg} ${s.col}`}>
              <FileText className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search" className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white min-w-[150px]"><option>2025-2026</option></select>
        <button className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center"><Download className="w-4 h-4"/></button>
      </div>
      
      <TableBlock headers={['S. No.', 'Invoice ID', 'Salary For', 'Date', 'Net Salary', 'Payment Method', 'Status', 'Payslip', 'Action']}>
        {[
          { no: 1, id: 'ABC1234', for: 'Jan 2025', date: '03/01/2025', net: '20,000', method: 'Bank', status: 'Paid', sCol: 'text-emerald-500 bg-emerald-50' },
          { no: 2, id: 'ABC1234', for: 'Feb 2025', date: '03/02/2025', net: '20,000', method: '-', status: 'Unpaid', sCol: 'text-red-500 bg-red-50' },
          { no: 3, id: 'ABC1234', for: 'Mar 2025', date: '03/03/2025', net: '20,000', method: 'Online', status: 'Unpaid', sCol: 'text-red-500 bg-red-50' },
        ].map(r => (
          <tr key={r.no} className="border-b border-slate-100 text-sm">
            <td className="px-4 py-3">{r.no}.</td>
            <td className="px-4 py-3 font-semibold text-slate-600">{r.id}</td>
            <td className="px-4 py-3">{r.for}</td>
            <td className="px-4 py-3 text-slate-500">{r.date}</td>
            <td className="px-4 py-3 font-bold">{r.net}</td>
            <td className="px-4 py-3">{r.method}</td>
            <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.sCol}`}>● {r.status}</span></td>
            <td className="px-4 py-3">{r.status === 'Paid' ? <FileText className="w-4 h-4 text-teal-600"/> : '-'}</td>
            <td className="px-4 py-3">
              {r.status === 'Unpaid' && (
                <Link href={`/institute/payroll/pay?name=${encodeURIComponent(employee.name)}&type=Employee&salary=20000`} className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-block">
                  Pay Now
                </Link>
              )}
            </td>
          </tr>
        ))}
      </TableBlock>
      
      <div className="flex items-center justify-between mt-4 text-xs font-medium text-slate-500 border-b border-slate-100 pb-6 mb-6">
        <span>Showing 1-3 of 3 Entries</span>
        <div className="flex gap-1">
          <button className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50">&laquo;</button>
          <button className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50">&lsaquo;</button>
          <button className="w-7 h-7 rounded flex items-center justify-center bg-teal-600 text-white">1</button>
          <button className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-teal-600">2</button>
          <button className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50">&rsaquo;</button>
          <button className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50">&raquo;</button>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-sm font-bold text-slate-800 mb-2">Total Payment Amount</span>
        <div className="flex items-center p-1 rounded-xl border border-slate-300 w-64 bg-white shadow-sm">
          <input type="text" value="40000/-" readOnly className="flex-1 bg-transparent px-3 outline-none font-bold text-slate-700" />
          <Link href={`/institute/payroll/pay?name=${encodeURIComponent(employee.name)}&type=Employee&salary=40000`} className="px-6 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-sm inline-block">
            Pay
          </Link>
        </div>
      </div>
    </div>
  )
}

function LoginDetailsTab() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">User Name</label>
          <input type="text" value="abcd123" readOnly className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold bg-white outline-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Password</label>
          <div className="relative">
            <input type="password" value="123456@" readOnly className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold bg-white outline-none" />
            <EyeOff className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Confirm Password</label>
          <div className="relative">
            <input type="password" value="123456@" readOnly className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold bg-white outline-none" />
            <EyeOff className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentsTab() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm min-h-[300px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <Folder className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Documents</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">All uploaded employee documents will appear here.</p>
        <button className="mt-6 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow">Upload Document</button>
      </div>
    </div>
  )
}

export default function EmployeeProfilePage() {
  const params = useParams()
  const id = String(params.id)
  const employee = EMPLOYEES[id] || EMPLOYEES['1']
  
  const TABS = ['Employee Details', 'Attendance', 'Leave', 'Payroll', 'Login Details', 'Documents']
  const [activeTab, setActiveTab] = useState(TABS[0])

  return (
    <div className="max-w-[1100px] mx-auto w-full pb-10 animate-in fade-in duration-300 space-y-6">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Employee Profile</h1>
        <Link href="/institute/employees" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200"><X className="w-4 h-4"/></Link>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
             <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-teal-100 bg-teal-50">
               <img src={employee.avatar} alt="Profile" className="w-full h-full object-cover" />
             </div>
             <button className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center border-2 border-white"><Upload className="w-4 h-4"/></button>
          </div>
          <div className="flex items-center gap-2 mb-1">
             <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{employee.name}</h2>
             <div className="w-10 h-5 rounded-full bg-teal-600 relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"/></div>
          </div>
          <p className="text-xs font-bold text-slate-500">User ID : {employee.username}</p>
        </div>
        
        <div className="flex-1 w-full border-l-0 md:border-l border-slate-200 dark:border-slate-700 pl-0 md:pl-8">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-sm font-black text-slate-800">Personal Information</h3>
             <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
               <FileEdit className="w-3.5 h-3.5" /> Edit
             </button>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 max-w-lg">
             <div className="flex items-center gap-4"><span className="text-xs font-bold text-slate-500 w-24">Staff ID</span><span className="text-xs font-bold text-slate-300">:</span><span className="text-sm font-semibold text-slate-800">{employee.staffId}</span></div>
             <div className="flex items-center gap-4"><span className="text-xs font-bold text-slate-500 w-24">Designation</span><span className="text-xs font-bold text-slate-300">:</span><span className="text-sm font-semibold text-slate-800">{employee.designation}</span></div>
             <div className="flex items-center gap-4"><span className="text-xs font-bold text-slate-500 w-24">Mobile No.</span><span className="text-xs font-bold text-slate-300">:</span><span className="text-sm font-semibold text-slate-800">{employee.contact}</span></div>
             <div className="flex items-center gap-4"><span className="text-xs font-bold text-slate-500 w-24">Join Date</span><span className="text-xs font-bold text-slate-300">:</span><span className="text-sm font-semibold text-slate-800">{employee.joiningDate}</span></div>
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700 gap-4">
        <div className="flex flex-nowrap overflow-x-auto gap-8 px-2 w-full sm:w-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-teal-600'}`}>
              {tab}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 mb-2 sm:mb-0 whitespace-nowrap">
          <FileEdit className="w-3.5 h-3.5" /> Edit
        </button>
      </div>

      <div>
        {activeTab === 'Employee Details' && <EmployeeDetailsTab employee={employee} />}
        {activeTab === 'Attendance' && <AttendanceTab />}
        {activeTab === 'Leave' && <LeaveTab />}
        {activeTab === 'Payroll' && <PayrollTab employee={employee} />}
        {activeTab === 'Login Details' && <LoginDetailsTab />}
        {activeTab === 'Documents' && <DocumentsTab />}
      </div>
    </div>
  )
}

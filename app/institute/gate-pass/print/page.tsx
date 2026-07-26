'use client'

import React, { useState } from 'react'
import { ArrowLeft, Printer, Download } from 'lucide-react'
import Link from 'next/link'

function GatePassStudentPrint() {
  return (
    <div className="bg-white border-2 border-slate-800 rounded-lg p-0 max-w-3xl mx-auto text-sm font-semibold text-slate-800 print:shadow-none shadow-xl">
      {/* School Header */}
      <div className="flex items-start gap-4 px-6 pt-6 pb-4 bg-slate-100 border-b border-slate-300">
        <div className="w-20 h-20 bg-slate-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-black">School Name</h1>
          <p className="text-sm font-semibold text-slate-600">School Address</p>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
            <div className="text-left">
              <p>Affiliated To : CBSE Board</p>
              <p>UDISE: 1010101</p>
            </div>
            <p>Email: schoolname@gmail.com</p>
            <div className="text-right">
              <p>Affiliation No. : 123456</p>
              <p>Phone No.: 9999999999</p>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between px-6 py-3">
        <h2 className="text-xl font-black text-center flex-1">Gatepass - Student</h2>
        <p className="text-[10px] text-slate-400 font-bold">Printed On: 06 Mar, 2026 10:46am</p>
      </div>

      {/* Pass Body */}
      <div className="border border-slate-800 mx-4 mb-4 rounded">
        <div className="flex justify-between px-4 py-2.5 border-b border-slate-300 bg-slate-50">
          <span className="font-black text-xs">Gatepass ID: 2576</span>
          <span className="font-bold text-xs">Date & Time: 30 Jan, 2026 11:45:00am</span>
        </div>

        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="px-4 py-3 font-black bg-slate-50 w-1/4 border-r border-slate-300">Student&apos;s Name</td>
              <td className="px-4 py-3 border-r border-slate-300">Suman Singh</td>
              <td className="px-4 py-3 font-black bg-slate-50 w-16 border-r border-slate-300">Roll No</td>
              <td className="px-4 py-3 w-14 border-r border-slate-300">053</td>
              <td className="px-4 py-3 font-black bg-slate-50 w-14 border-r border-slate-300">Class</td>
              <td className="px-4 py-3 w-14">VII-B</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300">Parent&apos;s Name</td>
              <td className="px-4 py-3 border-r border-slate-300">Rajesh Singh</td>
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300" colSpan={2}>Parent&apos;s Mob. No.</td>
              <td className="px-4 py-3" colSpan={2}>9999999999</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300">Receiver&apos;s Name</td>
              <td className="px-4 py-3 border-r border-slate-300">Sohan Singh</td>
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300" colSpan={2}>Receiver&apos;s Mob. No</td>
              <td className="px-4 py-3" colSpan={2}>9999999999</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300">Relation with Receiver</td>
              <td className="px-4 py-3 border-r border-slate-300">Brother</td>
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300" colSpan={2}>Reason</td>
              <td className="px-4 py-3" colSpan={2}>Lorem Ipsum</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300">Vehicle No. & Remark</td>
              <td className="px-4 py-3 border-r border-slate-300">UP32GA0000</td>
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300" colSpan={2}>Exit Gate</td>
              <td className="px-4 py-3" colSpan={2}>Gate 4</td>
            </tr>
          </tbody>
        </table>

        <div className="border-t border-slate-300 px-4 py-6 text-right">
          <p className="font-black text-xs">Authorised Signature</p>
        </div>
      </div>
    </div>
  )
}

function GatePassVisitorPrint() {
  return (
    <div className="bg-white border-2 border-slate-800 rounded-lg p-0 max-w-3xl mx-auto text-sm font-semibold text-slate-800 print:shadow-none shadow-xl">
      {/* School Header */}
      <div className="flex items-start gap-4 px-6 pt-6 pb-4 bg-slate-100 border-b border-slate-300">
        <div className="w-20 h-20 bg-slate-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-black">School Name</h1>
          <p className="text-sm font-semibold text-slate-600">School Address</p>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
            <div className="text-left">
              <p>Affiliated To : CBSE Board</p>
              <p>UDISE: 1010101</p>
            </div>
            <p>Email: schoolname@gmail.com</p>
            <div className="text-right">
              <p>Affiliation No. : 123456</p>
              <p>Phone No.: 9999999999</p>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between px-6 py-3">
        <h2 className="text-xl font-black text-center flex-1">Gatepass - Visitor</h2>
        <p className="text-[10px] text-slate-400 font-bold">Printed On: 06 Mar, 2026 10:46am</p>
      </div>

      {/* Pass Body */}
      <div className="border border-slate-800 mx-4 mb-4 rounded">
        <div className="flex justify-between px-4 py-2.5 border-b border-slate-300 bg-slate-50">
          <span className="font-black text-xs">Gatepass ID: 2576</span>
          <span className="font-bold text-xs">Date & Time: 27 Aug, 2025 03:19:00pm</span>
        </div>

        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="px-4 py-3 font-black bg-slate-50 w-1/4 border-r border-slate-300">Visitor&apos;s Name</td>
              <td className="px-4 py-3 border-r border-slate-300">Ashok Kumar</td>
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300">Visit Purpose</td>
              <td className="px-4 py-3 border-r border-slate-300">Admission</td>
              <td className="px-4 py-3 w-16" />
            </tr>
            <tr className="border-b border-slate-300">
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300">Check-in time</td>
              <td className="px-4 py-3 border-r border-slate-300">03:19:00pm</td>
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300">Check-out time</td>
              <td className="px-4 py-3" colSpan={2}>04:19:00pm</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300">Visitor&apos;s Mob. No.</td>
              <td className="px-4 py-3 border-r border-slate-300">9999999999</td>
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300">Exit Gate</td>
              <td className="px-4 py-3" colSpan={2}>Gate No. 4</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-black bg-slate-50 border-r border-slate-300">Vehicle No. & Remark</td>
              <td className="px-4 py-3" colSpan={4}>UP32GA0000</td>
            </tr>
          </tbody>
        </table>

        <div className="border-t border-slate-300 px-4 py-6 text-right">
          <p className="font-black text-xs">Authorised Signature</p>
        </div>
      </div>
    </div>
  )
}

export default function GatePassPrintPage() {
  const [activePreview, setActivePreview] = useState<'student' | 'visitor'>('student')

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/institute/gate-pass" className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 bg-white shadow-sm"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-black text-slate-800">Gate Pass Preview</h1>
            <p className="text-xs text-slate-400">Preview and print gate pass for student or visitor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm"><Printer className="w-3.5 h-3.5" /> Print</button>
          <button className="flex items-center gap-1.5 px-4 py-2 border text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm"><Download className="w-3.5 h-3.5" /> Download</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button onClick={() => setActivePreview('student')} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${activePreview === 'student' ? 'bg-teal-600 text-white' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>Student Gate Pass</button>
        <button onClick={() => setActivePreview('visitor')} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${activePreview === 'visitor' ? 'bg-teal-600 text-white' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>Visitor Gate Pass</button>
      </div>

      {/* Preview */}
      <div className="py-6">
        {activePreview === 'student' ? <GatePassStudentPrint /> : <GatePassVisitorPrint />}
      </div>

    </div>
  )
}

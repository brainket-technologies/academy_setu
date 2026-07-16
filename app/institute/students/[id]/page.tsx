'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  X, Camera, Edit2, Upload, ArrowLeft, Search, Eye, EyeOff,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CheckCircle2, Trash2 
} from 'lucide-react'
import { 
  PersonalDetailsCard, PreviousSchoolCard, MedicalDetailsCard, TCDetailsCard, EducationTableCard,
  ParentsDetailsCard, AddressDetailsCard, BirthCertificateCard, ScholarshipDetailsCard, BplRteDetailsCard,
  GovtIdDetailsCard, GovtPortalDetailsCard, InfoRow
} from '@/components/students/ProfileCards'
import PaymentModeModal from '@/components/students/PaymentModeModal'

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Student Details')
  
  // Dummy data for testing the UI
  const dummyData = {
     firstName: 'Saurabh',
     rollNo: '42',
     admissionDate: '11/06/2025',
     class: 'Class 5',
     section: 'Section A',
     mobileNo: '9999999999',
  }

  const tabs = ['Student Details', 'Attendance', 'Leave', 'Fees', 'Login Details']

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center mb-6">
         <div className="flex items-center gap-4">
            <button onClick={() => router.push('/institute/students')} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 transition-colors">
               <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Student Profile</h2>
         </div>
         <button onClick={() => router.push('/institute/students')} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 transition-colors">
            <X className="w-4 h-4 stroke-[3]" />
         </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-8">
         
         {/* Top Info Section */}
         <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-8">
            
            {/* Left: Avatar & Name */}
            <div className="flex flex-col items-center gap-3 w-48 shrink-0">
               <div className="w-32 h-32 rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200 shadow-inner">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Student" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm cursor-pointer hover:bg-teal-700">
                     <Camera className="w-4 h-4" />
                  </div>
               </div>
               <div className="text-center w-full">
                  <div className="flex items-center justify-center gap-2">
                     <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{dummyData.firstName}</h3>
                     <div className="w-8 h-4 bg-teal-600 rounded-full flex items-center justify-end px-0.5 cursor-pointer shadow-inner">
                        <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                     </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">User ID : abcd123</p>
               </div>
            </div>

            {/* Right: Admission Information */}
            <div className="flex-1 flex flex-col">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-teal-600">
                     <Upload className="w-4 h-4" />
                     <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Admission Information</h3>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-500 hover:text-teal-600 hover:bg-slate-50 transition-colors">
                     <Edit2 className="w-3 h-3" /> Edit
                  </button>
               </div>
               
               <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <InfoRow label="Admission No." value="Stu123" />
                  <InfoRow label="Roll No." value="42" />
                  <InfoRow label="Class" value="Class 5" />
                  <InfoRow label="Section" value="Section A" />
                  <InfoRow label="Mobile No." value="9999999999" />
                  <InfoRow label="Admission Date" value="11/06/2025" />
               </div>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-700 px-2 justify-between">
            <div className="flex items-center gap-6 overflow-x-auto">
               {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                      activeTab === tab 
                        ? 'border-teal-600 text-teal-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
               ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-500 hover:text-teal-600 hover:bg-slate-50 transition-colors mb-2 shrink-0">
               <Edit2 className="w-3 h-3" /> Edit
            </button>
         </div>

         {/* Tab Content */}
         <div className="mt-2">
            {activeTab === 'Student Details' && <StudentDetailsTab data={dummyData} />}
            {activeTab === 'Attendance' && <AttendanceTab />}
            {activeTab === 'Leave' && <LeaveTab />}
            {activeTab === 'Fees' && <FeesTab />}
            {activeTab === 'Login Details' && <LoginDetailsTab />}
         </div>

      </div>
    </div>
  )
}

function StudentDetailsTab({ data }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="flex flex-col gap-6">
        <PersonalDetailsCard data={data} onEdit={() => {}} />
        <EducationTableCard data={data} onEdit={() => {}} />
        <ParentsDetailsCard data={data} onEdit={() => {}} />
        <BirthCertificateCard data={data} onEdit={() => {}} />
        <BplRteDetailsCard data={data} onEdit={() => {}} />
      </div>

      <div className="flex flex-col gap-6">
        <PreviousSchoolCard data={data} onEdit={() => {}} />
        <div className="grid grid-cols-2 gap-6">
          <MedicalDetailsCard data={data} onEdit={() => {}} />
          <TCDetailsCard data={data} onEdit={() => {}} />
        </div>
        <AddressDetailsCard data={data} onEdit={() => {}} />
        <GovtIdDetailsCard data={data} onEdit={() => {}} />
        <ScholarshipDetailsCard data={data} onEdit={() => {}} />
        <GovtPortalDetailsCard data={data} onEdit={() => {}} />
      </div>
    </div>
  )
}

function AttendanceTab() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = Array.from({length: 31}, (_, i) => i + 1)
  
  // Dummy logic to generate a colorful attendance grid
  const getStatus = (m: number, d: number) => {
    // some pseudo-random but consistent logic
    const n = m * 31 + d;
    if (n % 28 === 0) return 'H' // Holiday
    if (n % 19 === 0) return 'A' // Absent
    if (n % 42 === 0) return 'L' // Late
    if (n % 57 === 0) return 'F' // Half Day
    return 'P' // Present
  }

  const getColor = (status: string) => {
    switch(status) {
      case 'P': return 'text-emerald-500 font-bold'
      case 'A': return 'text-red-500 font-bold'
      case 'H': return 'text-purple-500 font-bold'
      case 'L': return 'text-yellow-500 font-bold'
      case 'F': return 'text-blue-500 font-bold'
      default: return 'text-slate-300'
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-6 animate-in fade-in">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
               <label className="text-[11px] font-bold text-slate-700">Select Session</label>
               <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 outline-none w-40 font-semibold focus:ring-2 focus:ring-teal-500">
                  <option>2025-2026</option>
               </select>
            </div>
            <button className="mt-5 w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm hover:bg-teal-700 shrink-0">
               <Upload className="w-4 h-4" />
            </button>
         </div>

         <div className="flex items-center gap-4 text-xs font-bold md:mt-5 flex-wrap">
            <span className="text-slate-700">Present : <span className="text-emerald-500">P</span></span>
            <span className="text-slate-700">Absent : <span className="text-red-500">A</span></span>
            <span className="text-slate-700">Holiday : <span className="text-purple-500">H</span></span>
            <span className="text-slate-700">Late : <span className="text-yellow-500">L</span></span>
            <span className="text-slate-700">Half Day : <span className="text-blue-500">F</span></span>
         </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
         <MetricCard value="227" label="Total Present" color="text-emerald-500" bg="bg-emerald-50 border-emerald-200" iconBg="bg-emerald-100" />
         <MetricCard value="70" label="Total Absent" color="text-red-500" bg="bg-red-50 border-red-200" iconBg="bg-red-100" />
         <MetricCard value="27" label="Half Day" color="text-blue-500" bg="bg-blue-50 border-blue-200" iconBg="bg-blue-100" />
         <MetricCard value="28" label="Total Late" color="text-yellow-600" bg="bg-yellow-50 border-yellow-200" iconBg="bg-yellow-100" />
         <MetricCard value="12" label="Total Holiday" color="text-purple-500" bg="bg-purple-50 border-purple-200" iconBg="bg-purple-100" />
      </div>

      {/* Attendance Grid */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl mt-2 bg-white">
         <table className="w-full text-center text-xs">
            <thead>
               <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-2 border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-50">Month</th>
                  {days.map(d => <th key={d} className="py-3 px-1.5 min-w-[24px]">{d}</th>)}
               </tr>
            </thead>
            <tbody>
               {months.map((month, mIdx) => (
                 <tr key={month} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50">
                    <td className="py-3 px-2 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 sticky left-0">{month}</td>
                    {days.map(d => {
                       const status = getStatus(mIdx, d)
                       return (
                         <td key={d} className={`py-3 px-1.5 ${getColor(status)}`}>
                            {status}
                         </td>
                       )
                    })}
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

    </div>
  )
}

function MetricCard({ value, label, color, bg, iconBg }: any) {
  return (
    <div className={`p-4 rounded-xl border ${bg} flex items-center justify-between`}>
       <div className="flex flex-col">
          <span className={`text-2xl font-black ${color}`}>{value}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
       </div>
       <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg} ${color}`}>
          <Camera className="w-4 h-4" /> {/* Just a placeholder icon */}
       </div>
    </div>
  )
}

function LeaveTab() {
  const leaves = [
    { type: 'Medical Leave', date: '17/11/2025-13/11/2025', duration: '3', applyDate: '11/11/2025' },
    { type: 'Casual Leave', date: '12/11/2025-13/11/2025', duration: '3', applyDate: '11/11/2025' },
    { type: 'Special Leave', date: '12/11/2025-13/11/2025', duration: '3', applyDate: '11/11/2025' },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in flex flex-col min-h-[400px]">
      
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Leave</h3>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-48 hidden sm:block"></div>
         </div>
         
         <div className="flex items-center gap-3">
            <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search" 
                 className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
               />
            </div>
            <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none w-32 focus:ring-2 focus:ring-teal-500">
               <option>2025-2026</option>
            </select>
            <button className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-sm hover:bg-teal-700 shrink-0">
               <Upload className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto p-6">
         <div className="min-w-[800px] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
               <thead>
                  <tr className="bg-sky-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                     <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">S. No.</th>
                     <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">Leave Type</th>
                     <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">Date</th>
                     <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">Duration</th>
                     <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">Apply Date</th>
                     <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300 text-center">Status</th>
                  </tr>
               </thead>
               <tbody>
                  {leaves.map((l, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                       <td className="py-4 px-6 text-slate-500">{i+1}.</td>
                       <td className="py-4 px-6 text-slate-600 font-semibold">{l.type}</td>
                       <td className="py-4 px-6 text-slate-500">{l.date}</td>
                       <td className="py-4 px-6 text-slate-500">{l.duration}</td>
                       <td className="py-4 px-6 text-slate-500">{l.applyDate}</td>
                       <td className="py-4 px-6 flex justify-center">
                          <button className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500 hover:bg-sky-200 transition-colors">
                             <Eye className="w-4 h-4" />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         
         {/* Pagination */}
         <div className="flex items-center justify-between mt-6">
            <p className="text-sm font-semibold text-slate-500">Showing 1-3 of 3 Entries</p>
            <div className="flex items-center gap-1">
               <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronsLeft className="w-4 h-4" /></button>
               <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
               <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-600 text-white font-bold">1</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-teal-600 font-bold hover:bg-slate-50">2</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
               <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronsRight className="w-4 h-4" /></button>
            </div>
         </div>
      </div>
    </div>
  )
}

function FeesTab() {
  const [feeCategory, setFeeCategory] = useState('All Fee')
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const allFeesData = [
    { month: 'Jan 2026', reg: '2000/-', adm: '5000/-', cls: '12000/-', lib: '2000/-', exm: '5000/-', hos: '12000/-', trn: '12000/-' },
    { month: 'Feb 2026', reg: '5000/-', adm: '12000/-', cls: '24000/-', lib: '5000/-', exm: '12000/-', hos: '24000/-', trn: '24000/-' },
    { month: 'Mar 2026', reg: '4000/-', adm: '50000/-', cls: '18000/-', lib: '4000/-', exm: '50000/-', hos: '18000/-', trn: '18000/-' },
  ]

  const classFeesData = [
    { month: 'Jan 2026', fee: '12000/-', fine: '12000/-', pending: '-', promo: 'null 20', total: '66000/-', status: 'Paid' },
    { month: 'Feb 2026', fee: '24000/-', fine: '24000/-', pending: '24000/-', promo: 'Admission25', total: '66000/-', status: 'Unpaid' },
    { month: 'Mar 2026', fee: '18000/-', fine: '18000/-', pending: '-', promo: '-', total: '66000/-', status: 'Paid' },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in flex flex-col min-h-[500px]">
      
      {/* Header Controls */}
      <div className="p-6 pb-2 flex items-center gap-4">
         <select 
           value={feeCategory}
           onChange={(e) => setFeeCategory(e.target.value)}
           className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none w-48 focus:ring-2 focus:ring-teal-500 shadow-sm"
         >
            <option>All Fee</option>
            <option>Class Fee</option>
            <option>Exam Fee</option>
            <option>Hostel Fee</option>
            <option>Transportation Fee</option>
            <option>Library Fee</option>
         </select>
         <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none w-32 focus:ring-2 focus:ring-teal-500 shadow-sm">
            <option>2025-26</option>
         </select>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1 flex flex-col">
         
         <div className="flex items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{feeCategory}</h3>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
         </div>

         {/* All Fee View */}
         {feeCategory === 'All Fee' && (
           <div className="flex-1 flex flex-col gap-6">
              <div className="flex-1 overflow-x-auto">
                 <div className="min-w-[1000px] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-center">
                       <thead>
                          <tr className="bg-sky-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                             <th className="py-4 px-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600" /></th>
                             <th className="py-4 px-4 font-bold text-slate-700">Month</th>
                             <th className="py-4 px-4 font-bold text-slate-700">Registration Fee</th>
                             <th className="py-4 px-4 font-bold text-slate-700">Admission Fee</th>
                             <th className="py-4 px-4 font-bold text-slate-700">Class Fee</th>
                             <th className="py-4 px-4 font-bold text-slate-700">Library Fee</th>
                             <th className="py-4 px-4 font-bold text-slate-700">Exam Fee</th>
                             <th className="py-4 px-4 font-bold text-slate-700">Hostel Fee</th>
                             <th className="py-4 px-4 font-bold text-slate-700">Transportation Fee</th>
                          </tr>
                       </thead>
                       <tbody>
                          {allFeesData.map((d, i) => (
                             <tr key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 transition-colors text-[13px]">
                                <td className="py-4 px-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600" /></td>
                                <td className="py-4 px-4 font-semibold text-slate-600">{d.month}</td>
                                <td className="py-4 px-4 text-slate-500">{d.reg}</td>
                                <td className="py-4 px-4 text-slate-500">{d.adm}</td>
                                <td className="py-4 px-4 text-slate-500">{d.cls}</td>
                                <td className="py-4 px-4 text-slate-500">{d.lib}</td>
                                <td className="py-4 px-4 text-slate-500">{d.exm}</td>
                                <td className="py-4 px-4 text-slate-500">{d.hos}</td>
                                <td className="py-4 px-4 text-slate-500">{d.trn}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                 <p className="text-sm font-semibold text-slate-500">Showing 1-3 of 3 Entries</p>
                 <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronsLeft className="w-4 h-4" /></button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-600 text-white font-bold">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-teal-600 font-bold hover:bg-slate-50">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronsRight className="w-4 h-4" /></button>
                 </div>
              </div>

              {/* Grand Total */}
              <div className="flex flex-col items-center gap-2 mt-8">
                 <span className="font-bold text-slate-800 text-sm">Grand Total</span>
                 <div className="flex items-center border-2 border-teal-600 rounded-xl overflow-hidden shadow-sm bg-teal-50/50">
                    <span className="px-6 py-2.5 font-black text-slate-800 text-lg w-40 text-center">66000/-</span>
                    <button onClick={() => setShowPaymentModal(true)} className="bg-teal-600 text-white font-bold px-8 py-2.5 hover:bg-teal-700 transition-colors">Pay</button>
                 </div>
              </div>
           </div>
         )}

         {/* Detailed Fee View (For any specific fee category) */}
         {feeCategory !== 'All Fee' && (
           <div className="flex-1 flex flex-col gap-6">
              <div className="flex-1 overflow-x-auto">
                 <div className="min-w-[1000px] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-center">
                       <thead>
                          <tr className="bg-sky-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                             <th className="py-4 px-3"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600" /></th>
                             <th className="py-4 px-3 font-bold text-slate-700">Month</th>
                             <th className="py-4 px-3 font-bold text-slate-700">{feeCategory}</th>
                             <th className="py-4 px-3 font-bold text-slate-700">Total Fine</th>
                             <th className="py-4 px-3 font-bold text-slate-700">Pending Fee</th>
                             <th className="py-4 px-3 font-bold text-slate-700">Promo Code</th>
                             <th className="py-4 px-3 font-bold text-slate-700">Total fee</th>
                             <th className="py-4 px-3 font-bold text-slate-700">Payment</th>
                             <th className="py-4 px-3 font-bold text-slate-700">Status</th>
                             <th className="py-4 px-3 font-bold text-slate-700">Action</th>
                          </tr>
                       </thead>
                       <tbody>
                          {classFeesData.map((d, i) => (
                             <tr key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 transition-colors text-[13px]">
                                <td className="py-4 px-3"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600" /></td>
                                <td className="py-4 px-3 font-semibold text-slate-600">{d.month}</td>
                                <td className="py-4 px-3 text-slate-500">{d.fee}</td>
                                <td className="py-4 px-3 text-slate-500">{d.fine}</td>
                                <td className="py-4 px-3 text-slate-500">{d.pending}</td>
                                <td className="py-4 px-3 text-slate-500">{d.promo}</td>
                                <td className="py-4 px-3 font-bold text-slate-700">{d.total}</td>
                                <td className="py-4 px-3">
                                   {d.status === 'Unpaid' ? (
                                      <button onClick={() => setShowPaymentModal(true)} className="bg-teal-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-md hover:bg-teal-700 shadow-sm">Pay Now</button>
                                   ) : (
                                      <span className="text-slate-400">-</span>
                                   )}
                                </td>
                                <td className="py-4 px-3">
                                   {d.status === 'Paid' ? (
                                     <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paid
                                     </span>
                                   ) : (
                                     <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Unpaid
                                     </span>
                                   )}
                                </td>
                                <td className="py-4 px-3">
                                   <div className="flex justify-center gap-1.5">
                                      <button className="w-7 h-7 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition-colors">
                                         <CheckCircle2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button className="w-7 h-7 flex items-center justify-center bg-rose-100 text-rose-600 rounded hover:bg-rose-200 transition-colors">
                                         <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-2">
                 <p className="text-sm font-semibold text-slate-500">Showing 1-3 of 3 Entries</p>
                 <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronsLeft className="w-4 h-4" /></button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-600 text-white font-bold">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-teal-600 font-bold hover:bg-slate-50">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronsRight className="w-4 h-4" /></button>
                 </div>
              </div>

           </div>
         )}
      </div>

      {showPaymentModal && <PaymentModeModal onClose={() => setShowPaymentModal(false)} />}
    </div>
  )
}

function LoginDetailsTab() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="bg-white border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Login/Account Details</h3>
        <div className="h-px bg-slate-300 dark:bg-slate-700 w-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">User Name</label>
          <input 
            type="text" 
            defaultValue="aloktiwari2012325" 
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              defaultValue="2012325AlokTiwari@" 
              className="w-full p-3 pr-10 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" 
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              defaultValue="2012325AlokTiwari@" 
              className="w-full p-3 pr-10 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" 
            />
            <button 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 opacity-50"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

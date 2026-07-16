'use client'

import React, { useState } from 'react'
import { X, Camera, Edit2, Upload } from 'lucide-react'
import { 
  PersonalDetailsCard, PreviousSchoolCard, MedicalDetailsCard, TCDetailsCard, EducationTableCard,
  ParentsDetailsCard, AddressDetailsCard, BirthCertificateCard, ScholarshipDetailsCard, BplRteDetailsCard,
  GovtIdDetailsCard, GovtPortalDetailsCard, InfoRow
} from './ProfileCards'

export default function StudentProfileModal({ student, onClose }: { student: any, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('Student Details')
  
  // Dummy data for testing the UI
  const dummyData = {
     firstName: 'Saurabh',
     rollNo: '42',
     admissionDate: '11/06/2025',
     class: 'Class 5',
     section: 'Section A',
     mobileNo: '9999999999',
     // ... other fields will use defaults inside the cards
  }

  const tabs = ['Student Details', 'Attendance', 'Leave', 'Fees', 'Login Details']

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-[1000px] bg-slate-100 dark:bg-slate-900 h-full overflow-y-auto animate-in slide-in-from-right-8 duration-300 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center shadow-sm">
           <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Student Profile</h2>
           <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 transition-colors">
              <X className="w-4 h-4 stroke-[3]" />
           </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
           
           {/* Top Info Section */}
           <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-8">
              
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
              <div className="flex items-center gap-6">
                 {tabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm font-bold transition-all border-b-2 ${
                        activeTab === tab 
                          ? 'border-teal-600 text-teal-600' 
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {tab}
                    </button>
                 ))}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-500 hover:text-teal-600 hover:bg-slate-50 transition-colors mb-2">
                 <Edit2 className="w-3 h-3" /> Edit
              </button>
           </div>

           {/* Tab Content */}
           <div className="mt-2">
              {activeTab === 'Student Details' && <StudentDetailsTab data={dummyData} />}
              {activeTab === 'Attendance' && <AttendanceTab />}
              {activeTab === 'Leave' && <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-xl shadow-sm">Leave Data Coming Soon...</div>}
              {activeTab === 'Fees' && <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-xl shadow-sm">Fees Data Coming Soon...</div>}
              {activeTab === 'Login Details' && <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-xl shadow-sm">Login Details Coming Soon...</div>}
           </div>

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
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-6 animate-in fade-in">
      
      {/* Header Controls */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
               <label className="text-[11px] font-bold text-slate-700">Select Session</label>
               <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 outline-none w-40 font-semibold focus:ring-2 focus:ring-teal-500">
                  <option>2025-2026</option>
               </select>
            </div>
            <button className="mt-5 w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm hover:bg-teal-700">
               <Upload className="w-4 h-4" />
            </button>
         </div>

         <div className="flex items-center gap-4 text-xs font-bold mt-5">
            <span className="text-slate-700">Present : <span className="text-emerald-500">P</span></span>
            <span className="text-slate-700">Absent : <span className="text-red-500">A</span></span>
            <span className="text-slate-700">Holiday : <span className="text-purple-500">H</span></span>
            <span className="text-slate-700">Late : <span className="text-yellow-500">L</span></span>
            <span className="text-slate-700">Half Day : <span className="text-blue-500">F</span></span>
         </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-5 gap-4">
         <MetricCard value="227" label="Total Present" color="text-emerald-500" bg="bg-emerald-50 border-emerald-200" iconBg="bg-emerald-100" />
         <MetricCard value="70" label="Total Absent" color="text-red-500" bg="bg-red-50 border-red-200" iconBg="bg-red-100" />
         <MetricCard value="27" label="Half Day" color="text-blue-500" bg="bg-blue-50 border-blue-200" iconBg="bg-blue-100" />
         <MetricCard value="28" label="Total Late" color="text-yellow-600" bg="bg-yellow-50 border-yellow-200" iconBg="bg-yellow-100" />
         <MetricCard value="12" label="Total Holiday" color="text-purple-500" bg="bg-purple-50 border-purple-200" iconBg="bg-purple-100" />
      </div>

      {/* Attendance Grid */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl mt-2">
         <table className="w-full text-center text-xs">
            <thead>
               <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-2 border-r border-slate-200 dark:border-slate-700">Month</th>
                  {days.map(d => <th key={d} className="py-3 px-1.5 w-6">{d}</th>)}
               </tr>
            </thead>
            <tbody>
               {months.map((month, mIdx) => (
                 <tr key={month} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50">
                    <td className="py-3 px-2 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">{month}</td>
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

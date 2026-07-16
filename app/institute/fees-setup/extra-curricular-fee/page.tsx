'use client'

import React, { useState } from 'react'
import { Search, Upload, Filter, MoreVertical, Receipt, Tag, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Calendar as CalendarIcon, Pencil, Trash2, X, User } from 'lucide-react'

const APPLICABLE_STUDENTS = Array(10).fill({
  admissionNo: 'Sch10654',
  rollNo: '1456',
  name: 'Sohan Singh',
  className: 'Class',
  contact: '9999999999',
  feesIcon: true,
  tagIcon: true,
  status: 'Paid'
}).map((s, i) => ({
  ...s,
  id: i + 1,
  status: [1, 3, 4, 5, 7, 8].includes(i + 1) ? 'Paid' : 'Unpaid'
}))

const EXTRA_CURRIC_FEE_CHART = [
  { id: 1, class: 'Class VII', studentType: 'New', monthly: '1000/-', quarterly: '3000/-', halfYearly: '6000/-', yearly: '12000/-', date: '15/06/2025', time: '11:30 AM' },
  { id: 2, class: 'Class VIII', studentType: 'Old', monthly: '2000/-', quarterly: '6000/-', halfYearly: '12000/-', yearly: '24000/-', date: '15/06/2025', time: '11:30 AM' },
  { id: 3, class: 'Class IX', studentType: 'All', monthly: '1500/-', quarterly: '4500/-', halfYearly: '90000/-', yearly: '18000/-', date: '15/06/2025', time: '11:30 AM' },
]

export default function ExtraCurricularFeePage() {
  const [activeTab, setActiveTab] = useState('Extra Curric. Fee Chart')
  const [showForm, setShowForm] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [isLateFeeEnabled, setIsLateFeeEnabled] = useState(false)
  const [studentType, setStudentType] = useState('All')

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Extra Curricular Fee</h1>
        <button onClick={() => setShowForm(!showForm)} className="w-8 h-8 flex items-center justify-center rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Create Extra Curricular Fee Classwise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 mb-8">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700">Activity Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter Name" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700">Activity Description</label>
              <input type="text" placeholder="Enter Description" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700">Activity Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="text" placeholder="Select Date" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <CalendarIcon className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700">Amount <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter Amount" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700">Class <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 flex-1">
                  <option>Select Class</option>
                </select>
                <button className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="hidden lg:block"></div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700">Student Type</label>
              <div className="flex items-center gap-4 py-2.5">
                <label className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold cursor-pointer">
                  <input type="radio" name="studentType" checked={studentType === 'All'} onChange={() => setStudentType('All')} className="accent-teal-600" /> All
                </label>
                <label className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold cursor-pointer">
                  <input type="radio" name="studentType" checked={studentType === 'Manual'} onChange={() => setStudentType('Manual')} className="accent-teal-600" /> Manual
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-2">
              <label className="text-[11px] font-bold text-slate-700">Student Name</label>
              <div className="min-h-[42px] px-2 py-1.5 rounded-lg border border-slate-200 bg-white flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-teal-500">
                <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-md border border-slate-200">
                  <User className="w-3 h-3 text-slate-400" />
                  134 Rahul
                  <X className="w-3 h-3 text-slate-400 hover:text-red-500 cursor-pointer transition-colors" />
                </div>
                <input type="text" className="flex-1 min-w-[120px] text-sm focus:outline-none bg-transparent" placeholder={studentType === 'Manual' ? "Type student name..." : ""} disabled={studentType === 'All'} />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12 mb-8 border-t border-slate-100 pt-6">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-700">Late Fee</span>
              <div className="flex items-center gap-4 mt-1.5">
                <label className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold cursor-pointer">
                  <input type="radio" name="lateFee" checked={isLateFeeEnabled} onChange={() => setIsLateFeeEnabled(true)} className="accent-teal-600" /> Yes
                </label>
                <label className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold cursor-pointer">
                  <input type="radio" name="lateFee" checked={!isLateFeeEnabled} onChange={() => setIsLateFeeEnabled(false)} className="accent-teal-600" /> No
                </label>
              </div>
            </div>

            {isLateFeeEnabled && (
              <div className="flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Per Day Amount</label>
                  <input type="text" placeholder="Enter Amount" className="w-full md:w-56 px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Apply From</label>
                  <div className="relative w-full md:w-56">
                    <input type="text" placeholder="Select Date" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <CalendarIcon className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button className="px-10 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">
              Create
            </button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">All Extra Curricular Fee</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by Name, Class, Student Type" 
                className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
              <Upload className="w-4 h-4" />
            </button>
            <button onClick={() => setShowFilter(true)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <button onClick={() => setActiveTab('Extra Curric. Fee Chart')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
            activeTab === 'Extra Curric. Fee Chart' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
          }`}>
            Extra Curric. Fee Chart <span className="bg-white text-amber-700 px-1.5 py-0.5 rounded text-[10px]">03</span>
          </button>
          <button onClick={() => setActiveTab('Applicable Student')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
            activeTab === 'Applicable Student' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
          }`}>
            Aplicable Student <span className="bg-white text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">456</span>
          </button>
          <button onClick={() => setActiveTab('Paid Student')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
            activeTab === 'Paid Student' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
          }`}>
            Paid Student <span className="bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 text-[10px]">250</span>
          </button>
          <button onClick={() => setActiveTab('Pending Student')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
            activeTab === 'Pending Student' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
          }`}>
            Pending Student <span className="bg-white text-red-700 px-1.5 py-0.5 rounded border border-red-100 text-[10px]">120</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 relative min-h-[400px]">
          {activeTab === 'Applicable Student' && (
            <table className="w-full text-xs text-center">
              <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-3">S. No.</th>
                  <th className="px-3 py-3">Admission No.</th>
                  <th className="px-3 py-3">Roll No.</th>
                  <th className="px-3 py-3 text-left">Name</th>
                  <th className="px-3 py-3">Class</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Fees</th>
                  <th className="px-3 py-3">Tag</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {APPLICABLE_STUDENTS.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3 text-slate-500 font-medium">{student.id}.</td>
                    <td className="px-3 py-3 text-slate-600 font-semibold">{student.admissionNo}</td>
                    <td className="px-3 py-3 text-slate-600">{student.rollNo}</td>
                    <td className="px-3 py-3 text-slate-700 font-bold text-left">{student.name}</td>
                    <td className="px-3 py-3 text-slate-600">{student.className}</td>
                    <td className="px-3 py-3 text-slate-600">{student.contact}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <Receipt className="w-4 h-4 text-teal-500" />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <Tag className="w-4 h-4 text-fuchsia-500" />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                        student.status === 'Paid' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-red-500 bg-red-50 border border-red-100'
                      }`}>
                        ● {student.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <button className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'Extra Curric. Fee Chart' && (
            <table className="w-full text-[11px] text-center">
              <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-2 py-3">S. No.</th>
                  <th className="px-2 py-3">Class</th>
                  <th className="px-2 py-3">Student Type</th>
                  <th className="px-2 py-3">Monthly Fee</th>
                  <th className="px-2 py-3">Quarterly Fee</th>
                  <th className="px-2 py-3">Half Yearly Fee</th>
                  <th className="px-2 py-3">Yearly Fee</th>
                  <th className="px-2 py-3">Created At</th>
                  <th className="px-2 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {EXTRA_CURRIC_FEE_CHART.map((item, i) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-2 py-4 text-slate-500 font-medium">{i + 1}.</td>
                    <td className="px-2 py-4 text-slate-700 font-semibold">{item.class}</td>
                    <td className="px-2 py-4 text-slate-600">{item.studentType}</td>
                    <td className="px-2 py-4 text-slate-700 font-bold">{item.monthly}</td>
                    <td className="px-2 py-4 text-slate-700 font-bold">{item.quarterly}</td>
                    <td className="px-2 py-4 text-slate-700 font-bold">{item.halfYearly}</td>
                    <td className="px-2 py-4 text-slate-700 font-bold">{item.yearly}</td>
                    <td className="px-2 py-4">
                      <div className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-600">
                        <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3 text-slate-400" /> {item.date}</span>
                        <span className="text-slate-400">@ {item.time}</span>
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button className="w-5 h-5 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab !== 'Applicable Student' && activeTab !== 'Extra Curric. Fee Chart' && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              Data for {activeTab}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-[11px] font-medium text-slate-500">
          <span>Showing 1-10 of 456 Entries</span>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronsLeft className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded flex items-center justify-center bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-teal-600">2</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronRight className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronsRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>

      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
            <div className="absolute right-4 top-4">
              <button onClick={() => setShowFilter(false)} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-800">Class</label>
                  <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-full">
                    <option>Select Class</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-800">Student Type</label>
                  <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-full">
                    <option>Select Type</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <button className="px-10 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">
                  Filter
                </button>
                <button onClick={() => setShowFilter(false)} className="px-10 py-2.5 rounded-lg bg-white border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors shadow-sm">
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

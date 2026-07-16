'use client'

import React, { useState } from 'react'
import { Search, Upload, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const FEE_COLLECTION_DATA = [
  { id: 1, class: 'Class VII', section: 'Section A', name: 'Rajesh', reg: '3000/-', adm: '6000/-', classFee: '12000/-', lib: '3000/-', exam: '6000/-' },
  { id: 2, class: 'Class VIII', section: 'Section B', name: 'Suresh', reg: '6000/-', adm: '12000/-', classFee: '24000/-', lib: '6000/-', exam: '12000/-' },
  { id: 3, class: 'Class IX', section: 'Section C', name: 'Aditya', reg: '4500/-', adm: '90000/-', classFee: '18000/-', lib: '4500/-', exam: '90000/-' },
]

export default function FeeCollectionPage() {
  const [activeTab, setActiveTab] = useState('All Fee Data')

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Fee Collection</h1>
        <button className="w-8 h-8 flex items-center justify-center rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Fees Management Overview */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">Fees Management</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 p-5 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-700">Fees Collection</h3>
              <div className="flex items-center gap-2">
                <select className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none">
                  <option>2023-2024</option>
                </select>
                <select className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none">
                  <option>Annual</option>
                </select>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            </div>
            
            {/* SVG Chart Mockup */}
            <div className="flex-1 relative min-h-[200px] w-full mt-2">
              <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-slate-400 font-medium pb-6">
                <div className="border-b border-slate-100 w-full flex items-center"><span className="w-8 -mt-2">7,500</span></div>
                <div className="border-b border-slate-100 w-full flex items-center"><span className="w-8 -mt-2">5,000</span></div>
                <div className="border-b border-slate-100 w-full flex items-center"><span className="w-8 -mt-2">2,500</span></div>
                <div className="border-b border-slate-100 w-full flex items-center"><span className="w-8 -mt-2">0</span></div>
              </div>
              
              {/* Chart Line & Area */}
              <div className="absolute inset-0 ml-10 mb-6 overflow-hidden">
                <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Highlight bar for May */}
                  <rect x="380" y="40" width="15" height="160" fill="#ccfbf1" rx="2" />
                  
                  {/* Path for area */}
                  <path d="M0,130 Q50,90 100,100 T200,140 T300,70 T400,40 T500,120 T600,100 T700,160 T800,90 T900,80 T1000,140 L1000,200 L0,200 Z" fill="url(#chartGradient)" />
                  
                  {/* Path for line */}
                  <path d="M0,130 Q50,90 100,100 T200,140 T300,70 T400,40 T500,120 T600,100 T700,160 T800,90 T900,80 T1000,140" fill="none" stroke="#2dd4bf" strokeWidth="3" />
                  
                  {/* Data points */}
                  <circle cx="100" cy="100" r="4" fill="white" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="200" cy="140" r="4" fill="white" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="300" cy="70" r="4" fill="white" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="400" cy="40" r="5" fill="#2dd4bf" stroke="white" strokeWidth="2" /> {/* Highlight point */}
                  <circle cx="500" cy="120" r="4" fill="white" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="600" cy="100" r="4" fill="white" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="700" cy="160" r="4" fill="white" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="800" cy="90" r="4" fill="white" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="900" cy="80" r="4" fill="white" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="1000" cy="140" r="4" fill="white" stroke="#2dd4bf" strokeWidth="2" />
                </svg>
              </div>

              {/* X Axis Labels */}
              <div className="absolute bottom-0 left-10 right-0 flex justify-between text-[9px] text-slate-400 font-medium">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>
          </div>

          {/* Fee Status Card */}
          <div className="rounded-2xl border border-slate-200 p-5 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-700">Fee Status</h3>
              <div className="flex items-center gap-2">
                <select className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none">
                  <option>Annual</option>
                </select>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex flex-col gap-4 flex-1 justify-center">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
                <span className="text-2xl font-black text-slate-700">1,335</span>
                <span className="px-3 py-1 rounded text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Paid
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
                <span className="text-2xl font-black text-slate-700">4,366</span>
                <span className="px-3 py-1 rounded text-[10px] font-bold text-amber-500 bg-amber-50 border border-amber-100 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Pending
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
                <span className="text-2xl font-black text-slate-700">208</span>
                <span className="px-3 py-1 rounded text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Overdue
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">All Fee Collection Data</h2>
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
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => setActiveTab('All Fee Data')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
              activeTab === 'All Fee Data' ? 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300' : 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100 hover:bg-fuchsia-100'
            }`}>
              All Fee Data <span className="bg-white text-fuchsia-700 px-1.5 py-0.5 rounded text-[10px]">03</span>
            </button>
            <button onClick={() => setActiveTab('Paid Student')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
              activeTab === 'Paid Student' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
            }`}>
              Paid Student <span className="bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 text-[10px]">250</span>
            </button>
            <button onClick={() => setActiveTab('Pending Student')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
              activeTab === 'Pending Student' ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
            }`}>
              Pending Student <span className="bg-white text-rose-700 px-1.5 py-0.5 rounded border border-rose-100 text-[10px]">120</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <select className="border border-slate-200 rounded-md px-2 py-1.5 bg-white outline-none">
              <option>2025-26</option>
            </select>
            <select className="border border-slate-200 rounded-md px-2 py-1.5 bg-white outline-none">
              <option>Class</option>
            </select>
            <select className="border border-slate-200 rounded-md px-2 py-1.5 bg-white outline-none">
              <option>Section</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 relative min-h-[250px]">
          {activeTab === 'All Fee Data' && (
            <table className="w-full text-[11px] text-center whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-4 text-left w-16">S. No.</th>
                  <th className="px-4 py-4">Class</th>
                  <th className="px-4 py-4">Section</th>
                  <th className="px-4 py-4 text-left">Student Name</th>
                  <th className="px-4 py-4">Registration Fee</th>
                  <th className="px-4 py-4">Admission Fee</th>
                  <th className="px-4 py-4">Class Fee</th>
                  <th className="px-4 py-4">Library Fee</th>
                  <th className="px-4 py-4">Exam Fee</th>
                </tr>
              </thead>
              <tbody>
                {FEE_COLLECTION_DATA.map((student, i) => (
                  <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 text-slate-500 font-medium text-left">{i + 1}.</td>
                    <td className="px-4 py-4 text-slate-600 font-semibold">{student.class}</td>
                    <td className="px-4 py-4 text-slate-600 font-medium">{student.section}</td>
                    <td className="px-4 py-4 text-slate-700 font-bold text-left">{student.name}</td>
                    <td className="px-4 py-4 text-slate-600">{student.reg}</td>
                    <td className="px-4 py-4 text-slate-600">{student.adm}</td>
                    <td className="px-4 py-4 text-slate-600">{student.classFee}</td>
                    <td className="px-4 py-4 text-slate-600">{student.lib}</td>
                    <td className="px-4 py-4 text-slate-600">{student.exam}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab !== 'All Fee Data' && (
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
      
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Search, Upload, Filter, Receipt, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Plus } from 'lucide-react'

interface AllFeeRecord {
  id: string | number
  class: string
  section: string
  name: string
  reg: string
  adm: string
  classFee: string
  lib: string
  exam: string
  hostel: string
  trans: string
  extra: string
  fine: string
  pending: string
  total: string
  status: 'Paid' | 'Unpaid'
}

export default function AllFeePage() {
  const [feeRecords, setFeeRecords] = useState<AllFeeRecord[]>([])
  const [classList, setClassList] = useState<string[]>([])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [filterClass, setFilterClass] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Load records and classes from localStorage
  useEffect(() => {
    const savedFees = localStorage.getItem('school_all_fees')
    if (savedFees) {
      try {
        setFeeRecords(JSON.parse(savedFees))
      } catch (e) {
        console.error(e)
        setFeeRecords([])
      }
    } else {
      localStorage.setItem('school_all_fees', JSON.stringify([]))
      setFeeRecords([])
    }

    const savedClasses = localStorage.getItem('school_masters_classes')
    if (savedClasses) {
      try {
        const parsed = JSON.parse(savedClasses)
        const names = parsed.map((c: any) => c.name || c.className).filter(Boolean)
        if (names.length > 0) setClassList(names)
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const saveFeeRecords = (updated: AllFeeRecord[]) => {
    setFeeRecords(updated)
    localStorage.setItem('school_all_fees', JSON.stringify(updated))
  }

  const handleDelete = (id: string | number) => {
    if (confirm('Are you sure you want to delete this fee record?')) {
      const updated = feeRecords.filter(item => item.id !== id)
      saveFeeRecords(updated)
    }
  }

  const handlePayNow = (id: string | number) => {
    const updated = feeRecords.map(item => {
      if (item.id === id) {
        return { ...item, status: 'Paid' as const, pending: '-' }
      }
      return item
    })
    saveFeeRecords(updated)
  }

  // Filtering
  const filteredData = feeRecords.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.section.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesClass = !filterClass || item.class === filterClass
    const matchesSection = !filterSection || item.section === filterSection
    const matchesStatus = !filterStatus || item.status === filterStatus

    return matchesSearch && matchesClass && matchesSection && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">All Fee</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Class, Section" 
              className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button onClick={() => setShowFilter(true)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-[11px] text-center whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-4">S. No.</th>
                <th className="px-3 py-4">Class</th>
                <th className="px-3 py-4">Section</th>
                <th className="px-3 py-4 text-left">Student Name</th>
                <th className="px-3 py-4">Registration Fee</th>
                <th className="px-3 py-4">Admission Fee</th>
                <th className="px-3 py-4">Class Fee</th>
                <th className="px-3 py-4">Library Fee</th>
                <th className="px-3 py-4">Exam Fee</th>
                <th className="px-3 py-4">Hostel Fee</th>
                <th className="px-3 py-4">Transportation Fee</th>
                <th className="px-3 py-4">Extra Curricular Fee</th>
                <th className="px-3 py-4">Total Fine</th>
                <th className="px-3 py-4">Pending Fee</th>
                <th className="px-3 py-4 text-emerald-600">Total Fee</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4">Fee Receipt</th>
                <th className="px-3 py-4">Payment</th>
                <th className="px-3 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={19} className="py-12 text-center text-slate-400 font-semibold text-xs">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((student, i) => (
                  <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-4 text-slate-500 font-medium">{i + 1}.</td>
                    <td className="px-3 py-4 text-slate-600">{student.class}</td>
                    <td className="px-3 py-4 text-slate-600">{student.section}</td>
                    <td className="px-3 py-4 text-slate-700 font-bold text-left">{student.name}</td>
                    <td className="px-3 py-4 text-slate-600">{student.reg}</td>
                    <td className="px-3 py-4 text-slate-600">{student.adm}</td>
                    <td className="px-3 py-4 text-slate-600">{student.classFee}</td>
                    <td className="px-3 py-4 text-slate-600">{student.lib}</td>
                    <td className="px-3 py-4 text-slate-600">{student.exam}</td>
                    <td className="px-3 py-4 text-slate-600">{student.hostel}</td>
                    <td className="px-3 py-4 text-slate-600">{student.trans}</td>
                    <td className="px-3 py-4 text-slate-600">{student.extra}</td>
                    <td className="px-3 py-4 text-slate-600">{student.fine}</td>
                    <td className="px-3 py-4 text-slate-600">{student.pending}</td>
                    <td className="px-3 py-4 text-slate-700 font-bold">{student.total}</td>
                    <td className="px-3 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        student.status === 'Paid' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-red-500 bg-red-50 border border-red-100'
                      }`}>
                        ● {student.status}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex justify-center">
                        <Receipt className="w-4 h-4 text-teal-500 cursor-pointer hover:text-teal-600 transition-colors" />
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex justify-center min-w-[70px]">
                        {student.status === 'Unpaid' && (
                          <button 
                            onClick={() => handlePayNow(student.id)}
                            className="px-3 py-1 rounded-md bg-teal-600 text-white text-[10px] font-bold hover:bg-teal-700 transition-colors shadow-sm"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-[11px] font-medium text-slate-500">
          <span>
            {filteredData.length === 0 
              ? 'Showing 0 of 0 Entries' 
              : `Showing 1-${filteredData.length} of ${filteredData.length} Entries`}
          </span>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronsLeft className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded flex items-center justify-center bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronRight className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronsRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden relative p-6">
            <button onClick={() => setShowFilter(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-base font-black text-slate-800 dark:text-slate-100 border-b pb-3 mb-6">Filter Options</h2>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Class</label>
                <select 
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  <option value="">All Classes</option>
                  {classList.map((cls, idx) => (
                    <option key={idx} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status</label>
                <select 
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  <option value="">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button 
                onClick={() => {
                  setFilterClass('')
                  setFilterSection('')
                  setFilterStatus('')
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Reset Filters
              </button>
              <button 
                onClick={() => setShowFilter(false)}
                className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}

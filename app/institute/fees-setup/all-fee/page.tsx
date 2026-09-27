'use client'

import React, { useState, useEffect } from 'react'
import { Search, Upload, Filter, Receipt, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Plus, Printer } from 'lucide-react'
import { toast } from 'sonner'

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
  [key: string]: any
}

export default function AllFeePage() {
  const [feeRecords, setFeeRecords] = useState<AllFeeRecord[]>([])
  const [classList, setClassList] = useState<string[]>([])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [filterClass, setFilterClass] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedRecordForReceipt, setSelectedRecordForReceipt] = useState<AllFeeRecord | null>(null)

  // Load records and classes from localStorage
  useEffect(() => {
    loadAllFees()

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

  const loadAllFees = () => {
    const parseAmt = (val: any) => {
      if (!val) return 0
      const str = String(val).replace(/[^0-9.]/g, '')
      return parseFloat(str) || 0
    }
    const fmtAmt = (num: number) => `${num.toLocaleString()}/-`

    let combined: AllFeeRecord[] = []

    // 1. Saved fees in school_all_fees
    const savedAllFees = localStorage.getItem('school_all_fees')
    if (savedAllFees) {
      try {
        const parsed = JSON.parse(savedAllFees)
        if (Array.isArray(parsed)) combined.push(...parsed)
      } catch (e) {
        console.error(e)
      }
    }

    // 2. Saved students in school_students
    const savedStudents = localStorage.getItem('school_students')
    if (savedStudents) {
      try {
        const studentsArr = JSON.parse(savedStudents)
        if (Array.isArray(studentsArr)) {
          studentsArr.forEach((stu: any) => {
            const stuId = stu.id || stu.admission_no || stu.admissionNo || Date.now()
            const existsIdx = combined.findIndex(c => String(c.id) === String(stuId))

            const regAmt = parseAmt(stu.regFee)
            const admAmt = parseAmt(stu.admFee)
            const classAmt = stu.isRteStudent === 'Yes' ? 0 : parseAmt(stu.classFee)
            const libAmt = parseAmt(stu.libFee)
            const examAmt = parseAmt(stu.examFee)
            const hostelAmt = parseAmt(stu.hostelFee)
            const transAmt = parseAmt(stu.transFee)
            const extraAmt = parseAmt(stu.extraFee)
            const fineAmt = parseAmt(stu.fine)

            const totalNum = regAmt + admAmt + classAmt + libAmt + examAmt + hostelAmt + transAmt + extraAmt + fineAmt
            const totalStr = totalNum > 0 ? fmtAmt(totalNum) : '0/-'

            const isPaid = stu.fees_status === 'Paid' || stu.status === 'Paid'

            const record: AllFeeRecord = {
              id: stuId,
              class: stu.class || (stu.class_name ? stu.class_name.replace(/\s*\([^)]*\)/, '').trim() : ''),
              section: stu.section || (stu.class_name ? stu.class_name.match(/\(([^)]+)\)/)?.[1] || '' : ''),
              name: `${stu.first_name || stu.firstName || ''} ${stu.last_name || stu.lastName || ''}`.trim() || 'Student',
              reg: regAmt > 0 ? fmtAmt(regAmt) : '0/-',
              adm: admAmt > 0 ? fmtAmt(admAmt) : '0/-',
              classFee: classAmt > 0 ? fmtAmt(classAmt) : '0/-',
              lib: libAmt > 0 ? fmtAmt(libAmt) : '0/-',
              exam: examAmt > 0 ? fmtAmt(examAmt) : '0/-',
              hostel: hostelAmt > 0 ? fmtAmt(hostelAmt) : '0/-',
              trans: transAmt > 0 ? fmtAmt(transAmt) : '0/-',
              extra: extraAmt > 0 ? fmtAmt(extraAmt) : '0/-',
              fine: fineAmt > 0 ? fmtAmt(fineAmt) : '0/-',
              pending: isPaid ? '0/-' : totalStr,
              total: totalStr,
              status: isPaid ? 'Paid' : 'Unpaid',
              ...stu
            }

            if (existsIdx >= 0) {
              combined[existsIdx] = { ...record, ...combined[existsIdx] }
            } else {
              combined.push(record)
            }
          })
        }
      } catch (e) {
        console.error(e)
      }
    }

    setFeeRecords(combined)
    localStorage.setItem('school_all_fees', JSON.stringify(combined))
  }

  const saveFeeRecords = (updated: AllFeeRecord[]) => {
    setFeeRecords(updated)
    localStorage.setItem('school_all_fees', JSON.stringify(updated))
  }

  const handleDelete = (id: string | number) => {
    if (confirm('Are you sure you want to delete this fee record?')) {
      const updated = feeRecords.filter(item => String(item.id) !== String(id))
      saveFeeRecords(updated)
      toast.success('Fee record deleted')
    }
  }

  const handlePayNow = (id: string | number) => {
    const updated = feeRecords.map(item => {
      if (String(item.id) === String(id)) {
        return { ...item, status: 'Paid' as const, fees_status: 'Paid', pending: '0/-' }
      }
      return item
    })
    saveFeeRecords(updated)

    // Sync to school_students as well
    const savedStudents = localStorage.getItem('school_students')
    if (savedStudents) {
      try {
        const studentsArr = JSON.parse(savedStudents)
        if (Array.isArray(studentsArr)) {
          const updatedStudents = studentsArr.map((s: any) => {
            if (String(s.id) === String(id)) {
              return { ...s, fees_status: 'Paid', pending: '0/-' }
            }
            return s
          })
          localStorage.setItem('school_students', JSON.stringify(updatedStudents))
        }
      } catch (e) {}
    }
    toast.success('Payment recorded successfully')
  }

  // Filtering
  const filteredData = feeRecords.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.section.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesClass = !filterClass || item.class.toLowerCase().includes(filterClass.toLowerCase())
    const matchesSection = !filterSection || item.section.toLowerCase().includes(filterSection.toLowerCase())
    const matchesStatus = !filterStatus || item.status === filterStatus

    return matchesSearch && matchesClass && matchesSection && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" /> All Fee Directory
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Itemized student fee breakdown records configured during admission</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Class, Section..." 
              className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
            />
          </div>
          <button 
            onClick={() => setShowFilter(true)} 
            className="h-9 px-3 flex items-center gap-1.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm text-xs font-bold"
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-[11px] text-center whitespace-nowrap">
            <thead className="bg-slate-900 text-white font-black border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
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
                <th className="px-3 py-4 text-amber-500">Pending Fee</th>
                <th className="px-3 py-4 text-emerald-400">Total Fee</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4">Fee Receipt</th>
                <th className="px-3 py-4">Payment</th>
                <th className="px-3 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold text-slate-700 dark:text-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={19} className="py-12 text-center text-slate-400 font-semibold text-xs">
                    No student fee records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((student, i) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-3 py-4 text-slate-400 font-medium">{i + 1}.</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{student.class || 'N/A'}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{student.section || '-'}</td>
                    <td className="px-3 py-4 text-slate-800 dark:text-slate-100 font-bold text-left">{student.name}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{student.reg || '0/-'}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{student.adm || '0/-'}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{student.classFee || '0/-'}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{student.lib || '0/-'}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{student.exam || '0/-'}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{student.hostel || '0/-'}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{student.trans || '0/-'}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{student.extra || '0/-'}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{student.fine || '0/-'}</td>
                    <td className="px-3 py-4 text-amber-600 font-bold">{student.pending || '0/-'}</td>
                    <td className="px-3 py-4 text-teal-600 dark:text-teal-400 font-black">{student.total || '0/-'}</td>
                    <td className="px-3 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        student.status === 'Paid' 
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200' 
                          : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200'
                      }`}>
                        ● {student.status}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => setSelectedRecordForReceipt(student)}
                          className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 hover:bg-teal-100 transition-colors shadow-sm"
                          title="View Receipt Breakdown"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex justify-center min-w-[70px]">
                        {student.status === 'Unpaid' ? (
                          <button 
                            onClick={() => handlePayNow(student.id)}
                            className="px-3 py-1 rounded-lg bg-teal-600 text-white text-[10px] font-bold hover:bg-teal-700 transition-colors shadow-sm"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[10px]">Paid ✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center hover:bg-rose-100 border border-rose-200 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-[11px] font-semibold text-slate-500">
          <span>
            {filteredData.length === 0 
              ? 'Showing 0 of 0 Entries' 
              : `Showing 1-${filteredData.length} of ${filteredData.length} Entries`}
          </span>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400"><ChevronsLeft className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400"><ChevronRight className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400"><ChevronsRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative p-6 border border-slate-200 dark:border-slate-700">
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
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
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
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
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

      {/* Itemized Fee Breakdown & Receipt Modal */}
      {selectedRecordForReceipt && (
        <FeeReceiptModal record={selectedRecordForReceipt} onClose={() => setSelectedRecordForReceipt(null)} />
      )}
      
    </div>
  )
}

function FeeReceiptModal({ record, onClose }: { record: AllFeeRecord, onClose: () => void }) {
  const parseNum = (val: any): number => {
    if (!val) return 0
    const str = String(val).replace(/[^0-9.]/g, '')
    return parseFloat(str) || 0
  }

  const items: { name: string, details?: string, amount: string, num: number }[] = []

  if (record.reg && record.reg !== '0/-') items.push({ name: 'Registration Fee', details: record.regFeeDuration || 'Standard', amount: record.reg, num: parseNum(record.reg) })
  if (record.adm && record.adm !== '0/-') items.push({ name: 'Admission Fee', details: record.admFeeDuration || 'Standard', amount: record.adm, num: parseNum(record.adm) })
  if (record.classFee && record.classFee !== '0/-') items.push({ name: 'Class Fee', details: `${record.classFeeDuration || ''}${record.isRteStudent === 'Yes' ? ' (RTE Exemption)' : ''}`, amount: record.classFee, num: parseNum(record.classFee) })
  if (record.lib && record.lib !== '0/-') items.push({ name: 'Library Fee', details: record.libFeeDuration || 'Standard', amount: record.lib, num: parseNum(record.lib) })
  if (record.exam && record.exam !== '0/-') items.push({ name: 'Exam Fee', details: record.examFeeDuration || 'Standard', amount: record.exam, num: parseNum(record.exam) })
  if (record.hostel && record.hostel !== '0/-') items.push({ name: 'Hostel Fee', details: [record.hostelType, record.hostelFeeDuration].filter(Boolean).join(' • '), amount: record.hostel, num: parseNum(record.hostel) })
  if (record.extra && record.extra !== '0/-') items.push({ name: 'Extra Curricular Fee', details: record.extraActivityName || 'Standard', amount: record.extra, num: parseNum(record.extra) })
  if (record.trans && record.trans !== '0/-') {
    const routeInfo = [record.transRoute, record.transStoppage, record.transDistance, record.transFeeDuration].filter(Boolean).join(' • ')
    items.push({ name: 'Transportation Fee', details: routeInfo, amount: record.trans, num: parseNum(record.trans) })
  }
  if (record.fine && record.fine !== '0/-') items.push({ name: 'Fine / Late Fee', details: 'Penalty', amount: record.fine, num: parseNum(record.fine) })

  const totalNum = items.reduce((sum, item) => sum + item.num, 0) || parseNum(record.total)
  const isPaid = record.status === 'Paid'
  const paidNum = isPaid ? totalNum : 0
  const dueNum = Math.max(0, totalNum - paidNum)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-teal-600/10 text-teal-600 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
             </div>
             <div>
               <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                 Fee Details - {record.name}
               </h2>
               <p className="text-xs text-slate-400 font-medium">Class: {record.class || 'N/A'} • Section: {record.section || 'A'}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Content */}
        <div className="p-6 overflow-y-auto space-y-6">
           
           {/* Metric Summary Bar */}
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl">
                 <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Configured Fee</span>
                 <span className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{totalNum.toLocaleString()}/-</span>
              </div>
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
                 <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Paid</span>
                 <span className="text-xl font-black text-emerald-600 mt-1 block">{paidNum.toLocaleString()}/-</span>
              </div>
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 rounded-2xl">
                 <span className="text-[10px] uppercase font-bold text-amber-600 block">Due Amount</span>
                 <span className="text-xl font-black text-amber-600 mt-1 block">{dueNum.toLocaleString()}/-</span>
              </div>
              <div className="p-4 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 rounded-2xl">
                 <span className="text-[10px] uppercase font-bold text-purple-600 block">Fee Status</span>
                 <span className="text-xs font-black mt-2 inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 uppercase">
                    ● {record.status}
                 </span>
              </div>
           </div>

           {/* Configured Fee Breakdown Table */}
           <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Itemized Fee Structure Breakdown</h3>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Fee Head Name</th>
                      <th className="py-3 px-4">Configuration / Duration</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold text-slate-700 dark:text-slate-200">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">No fee items configured for this student.</td>
                      </tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-3.5 px-4 text-slate-400">{idx + 1}.</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">{item.name}</td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-normal">{item.details || 'Standard'}</td>
                          <td className="py-3.5 px-4 text-right font-black text-teal-600 dark:text-teal-400">{item.amount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-50 dark:bg-slate-900/80 font-black text-slate-800 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700">
                        <td colSpan={3} className="py-3 px-4 text-right">Total Fee Amount:</td>
                        <td className="py-3 px-4 text-right text-teal-600 dark:text-teal-400 text-sm font-black">{totalNum.toLocaleString()}/-</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
           </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <button 
            onClick={() => toast.success('Printing fee breakdown receipt...')} 
            className="flex items-center gap-2 px-8 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          <button onClick={onClose} className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

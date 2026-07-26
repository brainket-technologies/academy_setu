'use client'

import React, { useState, useEffect } from 'react'
import { fetchStudents, moveStudent, fetchStudentFees } from './actions'
import { 
  Download, Upload, Filter, Plus, Search, MoreVertical, X, CheckCircle2, Ticket,
  Eye, Edit, Receipt, Banknote, CalendarCheck, FileCheck, FileBadge, RefreshCw, Trash2
} from 'lucide-react'
import AddStudentWizard from '@/components/students/AddStudentWizard'
import { useRouter } from 'next/navigation'

type ViewState = 'LIST' | 'FILTER' | 'MOVE_STUDENT' | 'ADD_STUDENT' | 'FEE_DETAILS';

export default function StudentsPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewState>('LIST')
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Selection/Update State
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    const res = await fetchStudents()
    if (res.success) {
      setStudents(res.data || [])
    }
    setLoading(false)
  }

  const handleOpenActionMenu = (id: string) => {
    setShowActionMenu(showActionMenu === id ? null : id)
  }

  const handleMoveClick = (student: any) => {
    setSelectedStudent(student)
    setShowActionMenu(null)
    setView('MOVE_STUDENT')
  }

  const handleFeeClick = (student: any) => {
    setSelectedStudent(student)
    setShowActionMenu(null)
    setView('FEE_DETAILS')
  }

  const handleProfileClick = (student: any) => {
    setSelectedStudent(student)
    setShowActionMenu(null)
    router.push(`/institute/students/${student.id || '123'}`)
  }

  const handleCloseModal = () => {
    setView('LIST')
    setSelectedStudent(null)
    loadStudents()
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-10">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">All Students</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-[300px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search by Name, Mobile no" 
               className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
             />
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center transition-colors shadow-sm shadow-indigo-600/20">
              <Download className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center transition-colors shadow-sm shadow-indigo-600/20">
              <Upload className="w-4 h-4" />
            </button>
            <button onClick={() => setView('FILTER')} className="w-9 h-9 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center transition-colors shadow-sm shadow-indigo-600/20">
              <Filter className="w-4 h-4" />
            </button>
            <button onClick={() => setView('ADD_STUDENT')} className="w-9 h-9 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center transition-colors shadow-sm shadow-indigo-600/20">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex-1">
        
        <div className="overflow-x-auto min-h-[400px]">
           <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#a29bba] text-[13px] font-semibold text-white">
                  <th className="py-4 px-4 text-center whitespace-nowrap rounded-tl-xl">S. No.</th>
                  <th className="py-4 px-4 whitespace-nowrap">Admission No.</th>
                  <th className="py-4 px-4 whitespace-nowrap">Roll No.</th>
                  <th className="py-4 px-4 min-w-[200px]">Name</th>
                  <th className="py-4 px-4 text-center whitespace-nowrap">Class</th>
                  <th className="py-4 px-4 whitespace-nowrap">Contact</th>
                  <th className="py-4 px-4 text-center whitespace-nowrap">Fees</th>
                  <th className="py-4 px-4 text-center whitespace-nowrap">Tag</th>
                  <th className="py-4 px-4 text-center whitespace-nowrap">Status</th>
                  <th className="py-4 px-4 text-center whitespace-nowrap rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-10 text-slate-400">Loading students...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-10 text-slate-400">No students found. Add one!</td></tr>
                ) : (
                  students.map((student, i) => (
                    <tr key={student.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                      <td className="py-3 px-4 text-center font-semibold text-slate-600">{i + 1}.</td>
                      <td className="py-3 px-4 text-slate-600 text-[13px]">{student.admission_no}</td>
                      <td className="py-3 px-4 text-slate-600 text-[13px]">{student.roll_no}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={student.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">{student.first_name} {student.last_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 text-[13px]">{student.class_name}</td>
                      <td className="py-3 px-4 text-slate-500 text-[13px]">{student.contact}</td>
                      <td className="py-3 px-4 text-center">
                         <div className="flex items-center justify-center">
                           <button onClick={() => handleFeeClick(student)} className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${student.fees_status === 'Paid' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                             <Ticket className="w-4 h-4" />
                           </button>
                         </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                         <div className="flex items-center justify-center">
                           <div className="p-1.5 rounded-lg bg-fuchsia-50 text-fuchsia-500">
                             <Ticket className="w-4 h-4" />
                           </div>
                         </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                         <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                           student.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 
                           student.status === 'Inactive' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                           'bg-slate-100 text-slate-600 border border-slate-200'
                         }`}>
                           {student.status}
                         </span>
                      </td>
                      <td className="py-3 px-4 text-center relative">
                        <button onClick={() => handleOpenActionMenu(student.id)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                           <MoreVertical className="w-4 h-4" />
                        </button>
                        {showActionMenu === student.id && (
                           <>
                             <div className="fixed inset-0 z-10" onClick={() => setShowActionMenu(null)} />
                             <div className="absolute right-10 top-2 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-20 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                                
                                <button onClick={() => handleProfileClick(student)} className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 bg-sky-50 dark:bg-sky-500/10 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors">
                                   <Eye className="w-4 h-4 text-sky-500" /> View
                                </button>
                                
                                <button className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                   <Edit className="w-4 h-4 text-emerald-500" /> Edit
                                </button>
                                
                                <button className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                   <Receipt className="w-4 h-4 text-purple-500" /> View Fee Structure
                                </button>
                                
                                <button className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                   <Banknote className="w-4 h-4 text-lime-500" /> Update Fee Structure
                                </button>
                                
                                <button className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                   <CalendarCheck className="w-4 h-4 text-orange-400" /> View Attendance
                                </button>
                                
                                <button className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                   <FileCheck className="w-4 h-4 text-fuchsia-500" /> Create TC
                                </button>
                                
                                <button className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                   <FileBadge className="w-4 h-4 text-amber-500" /> Create Certificate
                                </button>
                                
                                <button onClick={() => handleMoveClick(student)} className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                   <RefreshCw className="w-4 h-4 text-teal-500" /> Move Student
                                </button>
                                
                                <button className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                   <Trash2 className="w-4 h-4 text-red-500" /> Delete Student
                                </button>

                             </div>
                           </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
           </table>
        </div>

        {/* Pagination Dummy */}
        <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-500 px-2">
          <span>Showing 1-{Math.min(10, students.length)} of {students.length} Entries</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400">«</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400">‹</button>
            <button className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-teal-600">2</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-teal-600">›</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-teal-600">»</button>
          </div>
        </div>
      </div>

      {/* OVERLAYS */}
      {view === 'FILTER' && <FilterModal onClose={handleCloseModal} />}
      {view === 'MOVE_STUDENT' && <MoveStudentModal student={selectedStudent} onClose={handleCloseModal} />}
      {view === 'FEE_DETAILS' && <FeeDetailsModal student={selectedStudent} onClose={handleCloseModal} />}
      
      {/* ADD STUDENT WIZARD (FULL PAGE OVERLAY) */}
      {view === 'ADD_STUDENT' && (
        <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-900 overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
           <AddStudentWizard onClose={handleCloseModal} />
        </div>
      )}

    </div>
  )
}

function FilterModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Filter Students</h2>
          <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
             <FilterField label="Class"><select className="form-select"><option>Select Class</option></select></FilterField>
             <FilterField label="Section"><select className="form-select"><option>Select Section</option></select></FilterField>
             <FilterField label="Stream"><select className="form-select"><option>Select Stream</option></select></FilterField>
             <FilterField label="Gender"><select className="form-select"><option>Select Gender</option></select></FilterField>
             <FilterField label="Category"><select className="form-select"><option>Select Category</option></select></FilterField>
             <FilterField label="Sort By"><select className="form-select"><option>Select Option</option></select></FilterField>
             <FilterField label="RTE Student"><select className="form-select"><option>Select Option</option></select></FilterField>
             <FilterField label="Child With Special Needs"><select className="form-select"><option>Select Option</option></select></FilterField>
             <FilterField label="Referred By"><select className="form-select"><option>Select Option</option></select></FilterField>
             <FilterField label="House/Block"><select className="form-select"><option>Select Option</option></select></FilterField>
             <FilterField label="Is Migrated?"><select className="form-select"><option>Select Option</option></select></FilterField>
             <FilterField label="Having Balance?"><select className="form-select"><option>Select Option</option></select></FilterField>
             <FilterField label="Discount Head"><select className="form-select"><option>Select Option</option></select></FilterField>
             <FilterField label="Tag"><select className="form-select"><option>Select Tag</option></select></FilterField>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <button className="px-10 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm">
            Filter
          </button>
          <button className="px-10 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

function MoveStudentModal({ student, onClose }: { student: any, onClose: () => void }) {
  const [moveTo, setMoveTo] = useState('Passed Out')
  const [remark, setRemark] = useState('')
  const [disableLogin, setDisableLogin] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    const res = await moveStudent(student.id, { moveTo, remark, disableLogin })
    if (res.success) {
      onClose()
    } else {
      alert('Error moving student')
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Move Students</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full transition-colors text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1">Move To</label>
            <select 
               value={moveTo} onChange={(e) => setMoveTo(e.target.value)}
               className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            >
               <option value="Passed Out">Passed Out</option>
               <option value="Suspended">Suspended</option>
               <option value="Dropped Out">Dropped Out</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1">Remark</label>
            <textarea 
               value={remark} onChange={(e) => setRemark(e.target.value)}
               rows={4}
               placeholder="Enter Remark"
               className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input 
              type="checkbox" 
              checked={disableLogin} onChange={(e) => setDisableLogin(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" 
            />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Do you want to disable account login?</span>
          </label>
        </div>

        <div className="px-6 py-4 flex justify-center gap-4">
          <button onClick={handleSubmit} disabled={submitting} className="px-10 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm">
            {submitting ? 'Moving...' : 'Move'}
          </button>
          <button onClick={onClose} className="px-10 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterField({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1">{label}</label>
      {/* We intercept the child select and add our classes */}
      <div className="[&>select]:w-full [&>select]:px-3 [&>select]:py-2 [&>select]:bg-slate-50 dark:[&>select]:bg-slate-900 [&>select]:border [&>select]:border-slate-200 dark:[&>select]:border-slate-700 [&>select]:rounded-lg [&>select]:text-sm [&>select]:text-slate-600 dark:[&>select]:text-slate-300 [&>select]:focus:outline-none [&>select]:focus:ring-2 [&>select]:focus:ring-teal-500 [&>select]:transition-all">
         {children}
      </div>
    </div>
  )
}

function FeeDetailsModal({ student, onClose }: { student: any, onClose: () => void }) {
  const [feeData, setFeeData] = useState<any>({
    total_fees: 0,
    total_paid: 0,
    total_discount: 0,
    due_amount: 0,
    total_balance: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFees() {
      const res = await fetchStudentFees(student.id)
      if (res.success && res.data) {
        setFeeData(res.data)
      }
      setLoading(false)
    }
    loadFees()
  }, [student.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
          <div className="flex items-center gap-4 flex-1">
             <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Fee Details - {student.first_name}</h2>
             <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <button onClick={onClose} className="p-2 ml-4 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full transition-colors text-slate-500 border border-slate-200 dark:border-slate-600 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
           <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
             <table className="w-full text-sm text-center">
               <thead>
                 <tr className="bg-teal-50/50 dark:bg-teal-900/10 text-xs font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                   <th className="py-4 px-4 whitespace-nowrap">Total Fees</th>
                   <th className="py-4 px-4 whitespace-nowrap">Total Paid</th>
                   <th className="py-4 px-4 whitespace-nowrap">Total Discount</th>
                   <th className="py-4 px-4 whitespace-nowrap">Due Amount</th>
                   <th className="py-4 px-4 whitespace-nowrap">Total Balance</th>
                 </tr>
               </thead>
               <tbody>
                 {loading ? (
                   <tr>
                     <td colSpan={5} className="py-10 text-slate-400">Loading fee data...</td>
                   </tr>
                 ) : (
                   <tr>
                     <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{feeData.total_fees.toFixed(2)}</td>
                     <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{feeData.total_paid.toFixed(2)}</td>
                     <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{feeData.total_discount.toFixed(2)}</td>
                     <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{feeData.due_amount.toFixed(2)}</td>
                     <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-bold">{feeData.total_balance.toFixed(2)}</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex justify-center gap-4">
          <button className="px-8 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm">
            Print Receipt
          </button>
          <button className="px-8 py-2.5 bg-white border border-teal-600 text-teal-600 text-sm font-bold rounded-xl hover:bg-teal-50 transition-all shadow-sm">
            Save as PDF
          </button>
        </div>
      </div>
    </div>
  )
}

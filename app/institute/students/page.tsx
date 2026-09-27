'use client'

import React, { useState, useEffect } from 'react'
import { fetchStudents, moveStudent, fetchStudentFees } from './actions'
import { 
  Download, Upload, Filter, Plus, Search, MoreVertical, X, CheckCircle2, Ticket,
  Eye, Edit, Receipt, Banknote, CalendarCheck, FileCheck, FileBadge, RefreshCw, Trash2,
  Users, UserCheck, ShieldAlert, CreditCard, RotateCcw, ChevronLeft, ChevronRight, Phone
} from 'lucide-react'
import { toast } from 'sonner'
import AddStudentWizard from '@/components/students/AddStudentWizard'
import { useRouter } from 'next/navigation'

type ViewState = 'LIST' | 'FILTER' | 'MOVE_STUDENT' | 'ADD_STUDENT' | 'FEE_DETAILS'

export default function StudentsPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewState>('LIST')
  const [mounted, setMounted] = useState(false)
  
  const [students, setStudents] = useState<any[]>([])
  const [classList, setClassList] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // Selection/Update State
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showActionMenu, setShowActionMenu] = useState<string | number | null>(null)

  useEffect(() => {
    setMounted(true)
    loadStudents()
    loadClasses()
  }, [])

  const loadClasses = () => {
    const saved = localStorage.getItem('school_masters_classes')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const names = parsed.map((c: any) => c.className || c.name).filter(Boolean)
          setClassList(Array.from(new Set(names)))
        }
      } catch (e) {}
    }
  }

  const loadStudents = async () => {
    let localList: any[] = []
    const saved = localStorage.getItem('school_students')
    if (saved) {
      try {
        localList = JSON.parse(saved)
        if (Array.isArray(localList) && localList.length > 0) {
          setStudents(localList)
        }
      } catch (e) {
        console.error(e)
      }
    }

    try {
      const res = await fetchStudents()
      if (res && res.success && Array.isArray(res.data)) {
        const dbList = res.data.map((s: any) => ({
          ...s,
          first_name: s.first_name,
          last_name: s.last_name,
          contact: s.contact,
          class_name: s.class_name || s.class || '',
          avatar: (s.avatar && s.avatar.trim() !== '') ? s.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.first_name || 'Student')}`
        }))
        const dbIds = new Set(dbList.map(s => String(s.id)))
        const uniqueLocal = localList.filter(s => !dbIds.has(String(s.id)))
        setStudents([...dbList, ...uniqueLocal])
      }
    } catch (e) {}
  }

  const handleOpenActionMenu = (id: string | number) => {
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

  const handleEditClick = (student: any) => {
    setSelectedStudent(student)
    setShowActionMenu(null)
    setView('ADD_STUDENT')
  }

  const handleProfileClick = (student: any) => {
    setSelectedStudent(student)
    setShowActionMenu(null)
    router.push(`/institute/students/${student.id || '123'}`)
  }

  const handleDeleteClick = (student: any) => {
    setShowActionMenu(null)
    if (confirm(`Are you sure you want to delete student "${student.first_name || ''} ${student.last_name || ''}"?`)) {
      const updated = students.filter(s => String(s.id) !== String(student.id))
      setStudents(updated)
      localStorage.setItem('school_students', JSON.stringify(updated))
      toast.success('Student record deleted successfully')
    }
  }

  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.error('No student data to export')
      return
    }
    const headers = ['S.No', 'Admission No', 'Roll No', 'First Name', 'Last Name', 'Class', 'Contact', 'Fee Status', 'Status']
    const rows = filteredStudents.map((s, i) => [
      i + 1,
      `"${s.admission_no || s.admissionNo || ''}"`,
      `"${s.roll_no || s.rollNo || ''}"`,
      `"${s.first_name || s.firstName || ''}"`,
      `"${s.last_name || s.lastName || ''}"`,
      `"${s.class_name || s.class || ''}"`,
      `"${s.contact || s.mobileNo || ''}"`,
      `"${s.fees_status || 'Pending'}"`,
      `"${s.status || 'Active'}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Students_List_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exported student list successfully!')
  }

  const handleCloseModal = () => {
    setView('LIST')
    setSelectedStudent(null)
    loadStudents()
  }

  // Filtered Students Calculation
  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name || s.firstName || ''} ${s.last_name || s.lastName || ''}`.toLowerCase()
    const admNo = String(s.admission_no || s.admissionNo || '').toLowerCase()
    const rollNo = String(s.roll_no || s.rollNo || '').toLowerCase()
    const contact = String(s.contact || s.mobileNo || '').toLowerCase()
    const cls = String(s.class_name || s.class || '').toLowerCase()

    const matchesSearch = !searchQuery || 
      fullName.includes(searchQuery.toLowerCase()) || 
      admNo.includes(searchQuery.toLowerCase()) || 
      rollNo.includes(searchQuery.toLowerCase()) || 
      contact.includes(searchQuery.toLowerCase()) ||
      cls.includes(searchQuery.toLowerCase())

    const matchesClass = !selectedClass || cls.includes(selectedClass.toLowerCase())
    
    const feeStat = s.fees_status || 'Pending'
    const matchesFeeStatus = !selectedFeeStatus || feeStat.toLowerCase() === selectedFeeStatus.toLowerCase()

    const accStat = s.status || 'Active'
    const matchesStatus = !selectedStatus || accStat.toLowerCase() === selectedStatus.toLowerCase()

    return matchesSearch && matchesClass && matchesFeeStatus && matchesStatus
  })

  // Dynamic Stat Counters
  const totalCount = students.length
  const activeCount = students.filter(s => (s.status || 'Active') === 'Active').length
  const paidCount = students.filter(s => s.fees_status === 'Paid').length
  const pendingCount = totalCount - paidCount

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-10 flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Page Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-teal-600/10 text-teal-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
             </div>
             All Students
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Manage student directory, academic enrollment, fee structures & profile actions</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button 
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm"
            title="Export CSV"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          
          <button 
            type="button"
            onClick={() => setView('FILTER')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm"
            title="Advanced Filters"
          >
            <Filter className="w-4 h-4 text-teal-600" /> Filter
          </button>

          <button 
            onClick={() => {
              setSelectedStudent(null)
              setView('ADD_STUDENT')
            }} 
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-teal-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Student
          </button>
        </div>
      </div>

      {/* Dynamic Metric Stat Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block tracking-wider">Total Registered</span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">{totalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block tracking-wider">Active Students</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{activeCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 block tracking-wider">Fee Paid</span>
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1 block">{paidCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block tracking-wider">Fee Pending</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content & Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-md flex flex-col gap-6 w-full min-h-[500px]">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               placeholder="Search by Name, Admission No, Contact..." 
               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-700 dark:text-slate-200"
             />
             {searchQuery && (
               <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                 <X className="w-3.5 h-3.5" />
               </button>
             )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-3">
             {classList.length > 0 && (
               <select 
                 value={selectedClass}
                 onChange={e => setSelectedClass(e.target.value)}
                 className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
               >
                 <option value="">All Classes</option>
                 {classList.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             )}

             <select 
               value={selectedFeeStatus}
               onChange={e => setSelectedFeeStatus(e.target.value)}
               className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
             >
               <option value="">All Fee Statuses</option>
               <option value="Paid">Paid</option>
               <option value="Unpaid">Unpaid / Pending</option>
             </select>

             <select 
               value={selectedStatus}
               onChange={e => setSelectedStatus(e.target.value)}
               className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
             >
               <option value="">All Statuses</option>
               <option value="Active">Active</option>
               <option value="Inactive">Inactive</option>
               <option value="Passed Out">Passed Out</option>
               <option value="Suspended">Suspended</option>
             </select>

             {(searchQuery || selectedClass || selectedFeeStatus || selectedStatus) && (
               <button 
                 onClick={() => {
                   setSearchQuery('')
                   setSelectedClass('')
                   setSelectedFeeStatus('')
                   setSelectedStatus('')
                 }}
                 className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
               >
                 <RotateCcw className="w-3.5 h-3.5" /> Reset
               </button>
             )}
          </div>

        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
           <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 font-black text-white text-[12px] uppercase tracking-wider">
                  <th className="py-4 px-4 text-center">S. No.</th>
                  <th className="py-4 px-4">Admission No.</th>
                  <th className="py-4 px-4">Roll No.</th>
                  <th className="py-4 px-4 min-w-[200px]">Student Name</th>
                  <th className="py-4 px-4 text-center">Class</th>
                  <th className="py-4 px-4">Contact</th>
                  <th className="py-4 px-4 text-center">Fee Status</th>
                  <th className="py-4 px-4 text-center">Account Status</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold text-slate-600 dark:text-slate-300">
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12 text-slate-400 font-medium">Loading student records...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-slate-400 font-medium">No students found matching filters.</td></tr>
                ) : (
                  filteredStudents.map((student, i) => {
                    const fullName = `${student.first_name || student.firstName || ''} ${student.lastName || student.last_name || ''}`.trim()
                    const avatarUrl = (student.avatar && student.avatar.trim() !== '') 
                      ? student.avatar 
                      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.first_name || 'Student')}`

                    const isPaid = student.fees_status === 'Paid'
                    const statusVal = student.status || 'Active'

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-500">{i + 1}.</td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200 font-bold font-mono">{student.admission_no || student.admissionNo || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">{student.roll_no || student.rollNo || '-'}</td>
                        
                        {/* Avatar & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={avatarUrl} 
                              alt="Avatar" 
                              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover shrink-0 shadow-sm" 
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 dark:text-slate-100 hover:text-teal-600 transition-colors cursor-pointer" onClick={() => handleProfileClick(student)}>
                                {fullName || 'Student'}
                              </span>
                              {student.emailId || student.email ? (
                                <span className="text-[10px] text-slate-400 font-normal">{student.emailId || student.email}</span>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        {/* Class */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/60 rounded-lg text-slate-700 dark:text-slate-300 font-bold text-[11px] whitespace-nowrap">
                            {student.class_name || student.class || 'N/A'}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{student.contact || student.mobileNo || '-'}</span>
                          </div>
                        </td>

                        {/* Fee Status Button */}
                        <td className="py-3.5 px-4 text-center">
                           <button 
                             onClick={() => handleFeeClick(student)} 
                             className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide inline-flex items-center gap-1.5 transition-all shadow-sm ${
                               isPaid 
                                 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100' 
                                 : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                             }`}
                             title="Click to view fee details"
                           >
                             <Receipt className="w-3.5 h-3.5" />
                             {isPaid ? 'Paid' : 'Unpaid'}
                           </button>
                        </td>

                        {/* Account Status */}
                        <td className="py-3.5 px-4 text-center">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                             statusVal === 'Active' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200' : 
                             statusVal === 'Inactive' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200' :
                             'bg-slate-100 text-slate-600 border border-slate-200'
                           }`}>
                             ● {statusVal}
                           </span>
                        </td>

                        {/* Direct Action Buttons */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            <button 
                              onClick={() => handleProfileClick(student)} 
                              className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors shadow-sm" 
                              title="View Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleEditClick(student)} 
                              className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-sm" 
                              title="Edit Student Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleFeeClick(student)} 
                              className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors shadow-sm" 
                              title="View Fee Details"
                            >
                              <Banknote className="w-3.5 h-3.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleMoveClick(student)} 
                              className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors shadow-sm" 
                              title="Move Student Status"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteClick(student)} 
                              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shadow-sm" 
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
           </table>
        </div>

        {/* Footer Pagination */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold text-slate-500 gap-4">
          <span>Showing 1-{Math.min(10, filteredStudents.length)} of {filteredStudents.length} Entries</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">1</button>
            <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* OVERLAYS */}
      {view === 'FILTER' && <FilterModal onClose={handleCloseModal} classList={classList} onApplyFilter={(cls, feeStat, stat) => {
        setSelectedClass(cls)
        setSelectedFeeStatus(feeStat)
        setSelectedStatus(stat)
        setView('LIST')
      }} />}
      {view === 'MOVE_STUDENT' && <MoveStudentModal student={selectedStudent} onClose={handleCloseModal} />}
      {view === 'FEE_DETAILS' && <FeeDetailsModal student={selectedStudent} onClose={handleCloseModal} />}
      
      {/* ADD / EDIT STUDENT WIZARD OVERLAY */}
      {view === 'ADD_STUDENT' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
           <AddStudentWizard initialData={selectedStudent} onClose={handleCloseModal} />
        </div>
      )}

    </div>
  )
}

function FilterModal({ onClose, classList, onApplyFilter }: { onClose: () => void, classList: string[], onApplyFilter: (cls: string, feeStat: string, stat: string) => void }) {
  const [cls, setCls] = useState('')
  const [feeStat, setFeeStat] = useState('')
  const [stat, setStat] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Filter className="w-5 h-5 text-teal-600" /> Filter Students
          </h2>
          <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Class</label>
              <select value={cls} onChange={e => setCls(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">All Classes</option>
                {classList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>

           <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Fee Status</label>
              <select value={feeStat} onChange={e => setFeeStat(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">All Fee Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid / Pending</option>
              </select>
           </div>

           <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Account Status</label>
              <select value={stat} onChange={e => setStat(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Passed Out">Passed Out</option>
                <option value="Suspended">Suspended</option>
              </select>
           </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <button onClick={() => onApplyFilter(cls, feeStat, stat)} className="px-10 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20">
            Apply Filters
          </button>
          <button onClick={onClose} className="px-10 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            Cancel
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
      toast.success('Student status updated successfully')
      onClose()
    } else {
      toast.error('Error moving student')
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Move Student Status</h2>
          <button onClick={onClose} className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Move To</label>
            <select 
               value={moveTo} onChange={(e) => setMoveTo(e.target.value)}
               className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            >
               <option value="Passed Out">Passed Out</option>
               <option value="Suspended">Suspended</option>
               <option value="Dropped Out">Dropped Out</option>
               <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Remark</label>
            <textarea 
               value={remark} onChange={(e) => setRemark(e.target.value)}
               rows={4}
               placeholder="Enter Remark..."
               className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input 
              type="checkbox" 
              checked={disableLogin} onChange={(e) => setDisableLogin(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" 
            />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Disable student account login</span>
          </label>
        </div>

        <div className="px-6 py-4 flex justify-center gap-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <button onClick={handleSubmit} disabled={submitting} className="px-10 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20">
            {submitting ? 'Updating...' : 'Confirm Move'}
          </button>
          <button onClick={onClose} className="px-10 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function FeeDetailsModal({ student, onClose }: { student: any, onClose: () => void }) {
  const [dbFees, setDbFees] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFees() {
      if (!student?.id) {
        setLoading(false)
        return
      }
      const res = await fetchStudentFees(student.id)
      if (res.success && res.data) {
        setDbFees(res.data)
      }
      setLoading(false)
    }
    loadFees()
  }, [student?.id])

  // Extract all fee breakdown items configured for this student
  const feeItems: { name: string, details?: string, amountStr: string, numAmount: number }[] = []

  const parseNum = (val: any): number => {
    if (!val) return 0
    const str = String(val).replace(/[^0-9.]/g, '')
    return parseFloat(str) || 0
  }

  if (student?.regFee || student?.regFeeDuration) {
    const amt = parseNum(student.regFee)
    feeItems.push({ name: 'Registration Fee', details: student.regFeeDuration, amountStr: student.regFee || `${amt}/-`, numAmount: amt })
  }
  if (student?.admFee || student?.admFeeDuration) {
    const amt = parseNum(student.admFee)
    feeItems.push({ name: 'Admission Fee', details: student.admFeeDuration, amountStr: student.admFee || `${amt}/-`, numAmount: amt })
  }
  if (student?.classFee || student?.classFeeDuration) {
    const amt = parseNum(student.classFee)
    feeItems.push({ name: 'Class Fee', details: `${student.classFeeDuration || ''}${student.isRteStudent === 'Yes' ? ' (RTE Exemption)' : ''}`, amountStr: student.classFee || `${amt}/-`, numAmount: amt })
  }
  if (student?.libFee || student?.libFeeDuration) {
    const amt = parseNum(student.libFee)
    feeItems.push({ name: 'Library Fee', details: student.libFeeDuration, amountStr: student.libFee || `${amt}/-`, numAmount: amt })
  }
  if (student?.examFee || student?.examFeeDuration) {
    const amt = parseNum(student.examFee)
    feeItems.push({ name: 'Exam Fee', details: student.examFeeDuration, amountStr: student.examFee || `${amt}/-`, numAmount: amt })
  }
  if (student?.hostelFee || student?.hostelType || student?.hostelFeeDuration) {
    const amt = parseNum(student.hostelFee)
    feeItems.push({ name: 'Hostel Fee', details: [student.hostelType, student.hostelFeeDuration].filter(Boolean).join(' • '), amountStr: student.hostelFee || `${amt}/-`, numAmount: amt })
  }
  if (student?.extraFee || student?.extraActivityName) {
    const amt = parseNum(student.extraFee)
    feeItems.push({ name: 'Extra Curricular Fee', details: student.extraActivityName, amountStr: student.extraFee || `${amt}/-`, numAmount: amt })
  }
  if (student?.transFee || student?.transRoute || student?.transStoppage) {
    const amt = parseNum(student.transFee)
    const routeInfo = [student.transRoute, student.transStoppage, student.transDistance, student.transFeeDuration].filter(Boolean).join(' • ')
    feeItems.push({ name: 'Transportation Fee', details: routeInfo, amountStr: student.transFee || `${amt}/-`, numAmount: amt })
  }

  // Calculate totals
  const totalConfigured = feeItems.reduce((acc, curr) => acc + curr.numAmount, 0) || (dbFees?.total_fees || 0)
  const isPaid = student?.fees_status === 'Paid'
  const totalPaid = isPaid ? totalConfigured : (dbFees?.total_paid || 0)
  const dueAmount = Math.max(0, totalConfigured - totalPaid)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 flex-1">
             <div className="w-9 h-9 rounded-xl bg-teal-600/10 text-teal-600 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
             </div>
             <div>
               <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                 Fee Details - {student?.first_name || student?.firstName || 'Student'} {student?.last_name || student?.lastName || ''}
               </h2>
               <p className="text-[11px] text-slate-400 font-medium">Class: {student?.class_name || student?.class || 'N/A'} • Admission No: {student?.admission_no || student?.admissionNo || 'N/A'}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-1.5 ml-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Content */}
        <div className="p-6 overflow-y-auto space-y-6">
           
           {/* Metric Summary Bar */}
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl">
                 <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Configured Fee</span>
                 <span className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{totalConfigured.toLocaleString()}/-</span>
              </div>
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
                 <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Paid</span>
                 <span className="text-xl font-black text-emerald-600 mt-1 block">{totalPaid.toLocaleString()}/-</span>
              </div>
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 rounded-2xl">
                 <span className="text-[10px] uppercase font-bold text-amber-600 block">Due Amount</span>
                 <span className="text-xl font-black text-amber-600 mt-1 block">{dueAmount.toLocaleString()}/-</span>
              </div>
              <div className="p-4 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 rounded-2xl">
                 <span className="text-[10px] uppercase font-bold text-purple-600 block">Fee Status</span>
                 <span className="text-sm font-black mt-2 inline-block px-3 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                    ● {isPaid ? 'Paid' : 'Unpaid'}
                 </span>
              </div>
           </div>

           {/* Fee Structure Items Table */}
           <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Configured Fee Breakdown</h3>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Fee Head Name</th>
                      <th className="py-3 px-4">Configuration / Duration</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold text-slate-700 dark:text-slate-200">
                    {feeItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">No fee items configured for this student.</td>
                      </tr>
                    ) : (
                      feeItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-3.5 px-4 text-slate-400">{idx + 1}.</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">{item.name}</td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-normal">{item.details || 'Standard'}</td>
                          <td className="py-3.5 px-4 text-right font-black text-teal-600 dark:text-teal-400">{item.amountStr}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {feeItems.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-50 dark:bg-slate-900/80 font-black text-slate-800 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700">
                        <td colSpan={3} className="py-3 px-4 text-right">Total Configured Amount:</td>
                        <td className="py-3 px-4 text-right text-teal-600 dark:text-teal-400 text-sm font-black">{totalConfigured.toLocaleString()}/-</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
           </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <button onClick={() => toast.success('Printing fee structure receipt...')} className="px-8 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20">
            Print Receipt
          </button>
          <button onClick={onClose} className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

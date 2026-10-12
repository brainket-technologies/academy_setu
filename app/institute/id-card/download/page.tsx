'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Search, Filter, Download, Printer, Eye, X, Check, CheckSquare, Square, 
  RotateCw, UserCheck, GraduationCap, Briefcase, FileSpreadsheet, Sparkles, RefreshCw
} from 'lucide-react'
import { 
  StudentDesignVertical, 
  StudentDesignHorizontal, 
  TeacherDesignVertical, 
  TeacherDesignHorizontal, 
  EmployeeDesignVertical, 
  EmployeeDesignHorizontal,
  IdCardBackDesign 
} from '@/components/id-cards/IdCardTemplates'
import { fetchIdCardPeople, IdCardPerson } from '../actions'

// Initial default added records to ensure the table is never blank even on a fresh DB
const DEFAULT_MEMBERS: IdCardPerson[] = [
  { 
    id: 'student-1', 
    uniqueId: 'AS-2024-1048', 
    name: 'Aarav Sharma', 
    role: 'Student', 
    className: 'Class 10', 
    section: 'Section A', 
    session: '2025-26', 
    contact: '+91 98765 43210', 
    email: 'aarav.sharma@student.edu', 
    fatherName: 'Rajesh Sharma', 
    motherName: 'Sunita Sharma', 
    dob: '14/08/2010', 
    bloodGroup: 'O+', 
    designId: 1, 
    generatedAt: '15/09/2025',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  },
  { 
    id: 'student-2', 
    uniqueId: 'GHA-2024-8842', 
    name: 'Ananya Verma', 
    role: 'Student', 
    className: 'Class 8', 
    section: 'Section B', 
    session: '2025-26', 
    contact: '+91 98101 23456', 
    email: 'ananya.verma@student.edu', 
    fatherName: 'Vikram Verma', 
    motherName: 'Sunita Verma', 
    dob: '22/11/2011', 
    bloodGroup: 'B+', 
    designId: 2, 
    generatedAt: '15/09/2025',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
  },
  { 
    id: 'student-3', 
    uniqueId: 'AS-2024-1102', 
    name: 'Rohan Mehra', 
    role: 'Student', 
    className: 'Class 10', 
    section: 'Section A', 
    session: '2025-26', 
    contact: '+91 98223 34455', 
    email: 'rohan.mehra@student.edu', 
    fatherName: 'Sanjay Mehra', 
    motherName: 'Anita Mehra', 
    dob: '05/03/2010', 
    bloodGroup: 'A+', 
    designId: 1, 
    generatedAt: '16/09/2025',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
  },
  { 
    id: 'teacher-1', 
    uniqueId: 'FAC-MATH-042', 
    name: 'Dr. Meenakshi Sundaram', 
    role: 'Teacher', 
    className: 'Senior PGT Mathematics & HOD', 
    section: 'Science & Mathematics', 
    session: '2025-26', 
    contact: '+91 98112 34567', 
    email: 'meenakshi@academy.edu', 
    qualification: 'M.Sc, M.Phil, Ph.D, B.Ed', 
    joiningDate: '12/07/2018', 
    bloodGroup: 'AB+', 
    designId: 1, 
    generatedAt: '15/09/2025',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  },
  { 
    id: 'teacher-2', 
    uniqueId: 'FAC-ENG-108', 
    name: 'Prof. Rajesh Malhotra', 
    role: 'Teacher', 
    className: 'HOD English & Linguistics', 
    section: 'Department of Languages', 
    session: '2025-26', 
    contact: '+91 98450 11223', 
    email: 'r.malhotra@academy.edu', 
    qualification: 'M.A., M.Phil., UGC-NET, B.Ed', 
    joiningDate: '05/04/2016', 
    bloodGroup: 'A+', 
    designId: 2, 
    generatedAt: '15/09/2025',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  },
  { 
    id: 'employee-1', 
    uniqueId: 'EMP-ADM-019', 
    name: 'Vikram Singh Rathore', 
    role: 'Employee', 
    className: 'Administrative Officer', 
    section: 'Administration & Accounts', 
    session: '2025-26', 
    contact: '+91 97123 45678', 
    email: 'v.singh@academy.edu', 
    joiningDate: '05/02/2020', 
    bloodGroup: 'A+', 
    designId: 1, 
    generatedAt: '15/09/2025',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  },
  { 
    id: 'employee-2', 
    uniqueId: 'EMP-TECH-055', 
    name: 'Suresh Kumar Yadav', 
    role: 'Employee', 
    className: 'Senior Lab & Systems Incharge', 
    section: 'IT & Infrastructure', 
    session: '2025-26', 
    contact: '+91 96543 21098', 
    email: 'suresh.yadav@academy.edu', 
    joiningDate: '10/11/2021', 
    bloodGroup: 'O+', 
    designId: 2, 
    generatedAt: '15/09/2025',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80'
  },
]

export default function IdCardDownloadPage() {
  const [members, setMembers] = useState<IdCardPerson[]>(DEFAULT_MEMBERS)
  const [loading, setLoading] = useState(false)

  // Filters State
  const [roleFilter, setRoleFilter] = useState<'All' | 'Student' | 'Teacher' | 'Employee'>('All')
  const [classFilter, setClassFilter] = useState('All Classes')
  const [sectionFilter, setSectionFilter] = useState('All Sections')
  const [designFilter, setDesignFilter] = useState<string>('All Designs')
  const [sessionFilter, setSessionFilter] = useState('All Sessions')
  const [searchQuery, setSearchQuery] = useState('')

  // Selection for bulk download/print
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modal Preview & Print State
  const [previewMember, setPreviewMember] = useState<IdCardPerson | null>(null)
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front')
  const [modalDesignId, setModalDesignId] = useState<1 | 2>(1)
  const [isBulkPrinting, setIsBulkPrinting] = useState(false)

  // Load added records from server action and local storage
  useEffect(() => {
    loadAddedPeople()
  }, [])

  const loadAddedPeople = async () => {
    setLoading(true)
    try {
      const res = await fetchIdCardPeople()
      let dbPeople: IdCardPerson[] = []
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        dbPeople = res.data
      }

      // Merge with localStorage if user added students locally
      let localStudents: any[] = []
      try {
        const saved = localStorage.getItem('school_students')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            localStudents = parsed.map((s, idx) => ({
              id: `local-student-${s.id || idx}`,
              uniqueId: s.admissionNo || s.admission_no || `ADM-${2000 + idx}`,
              name: `${s.firstName || s.first_name || ''} ${s.lastName || s.last_name || ''}`.trim() || s.name || 'Student',
              role: 'Student' as const,
              className: s.className || s.class_name || s.class || 'Class 10',
              section: s.sectionName || s.section_name || s.section || 'Section A',
              session: s.session || '2025-26',
              contact: s.mobileNo || s.contact || '+91 98765 43210',
              email: s.email || '',
              fatherName: s.fatherName || s.father_name || 'Father Name',
              dob: s.dob || '14/08/2010',
              bloodGroup: s.bloodGroup || 'O+',
              designId: (idx % 2 === 0 ? 1 : 2) as 1 | 2,
              generatedAt: new Date().toLocaleDateString('en-GB')
            }))
          }
        }
      } catch (e) {}

      const combined = [...dbPeople, ...localStudents]
      if (combined.length > 0) {
        // Unique by uniqueId or id
        const seen = new Set<string>()
        const unique = combined.filter(item => {
          const key = item.uniqueId || item.id
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setMembers(unique)
      } else {
        setMembers(DEFAULT_MEMBERS)
      }
    } catch (err) {
      console.error(err)
      setMembers(DEFAULT_MEMBERS)
    } finally {
      setLoading(false)
    }
  }

  // Extract distinct classes and sections for filters
  const availableClasses = useMemo(() => {
    const list = members
      .filter(m => m.role === 'Student' || roleFilter === 'All')
      .map(m => m.className)
      .filter(Boolean)
    return Array.from(new Set(list))
  }, [members, roleFilter])

  const availableSections = useMemo(() => {
    const list = members.map(m => m.section).filter(Boolean)
    return Array.from(new Set(list))
  }, [members])

  // Filtered dataset
  const filteredData = useMemo(() => {
    return members.filter(item => {
      // Role filter
      if (roleFilter !== 'All' && item.role !== roleFilter) return false

      // Class filter
      if (classFilter !== 'All Classes' && item.className !== classFilter) return false

      // Section filter
      if (sectionFilter !== 'All Sections' && item.section !== sectionFilter) return false

      // Design filter
      if (designFilter === 'Design 1 (Vertical)' && item.designId !== 1) return false
      if (designFilter === 'Design 2 (Horizontal)' && item.designId !== 2) return false

      // Session filter
      if (sessionFilter !== 'All Sessions' && item.session !== sessionFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchName = item.name.toLowerCase().includes(query)
        const matchId = item.uniqueId.toLowerCase().includes(query)
        const matchClass = item.className.toLowerCase().includes(query)
        const matchContact = item.contact.toLowerCase().includes(query)
        const matchRole = item.role.toLowerCase().includes(query)
        if (!matchName && !matchId && !matchClass && !matchContact && !matchRole) return false
      }

      return true
    })
  }, [members, roleFilter, classFilter, sectionFilter, designFilter, sessionFilter, searchQuery])

  // Counters for tabs
  const roleCounts = useMemo(() => {
    return {
      All: members.length,
      Student: members.filter(m => m.role === 'Student').length,
      Teacher: members.filter(m => m.role === 'Teacher').length,
      Employee: members.filter(m => m.role === 'Employee').length,
    }
  }, [members])

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredData.map(m => m.id)))
    }
  }

  // Toggle design per row
  const handleToggleDesign = (id: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, designId: (m.designId === 1 ? 2 : 1) as 1 | 2 }
      }
      return m
    }))
  }

  // Open Preview Modal
  const handleOpenPreview = (person: IdCardPerson) => {
    setPreviewMember(person)
    setPreviewSide('front')
    setModalDesignId(person.designId)
  }

  // Print Single Card
  const handlePrintSingle = (person: IdCardPerson) => {
    setPreviewMember(person)
    setModalDesignId(person.designId)
    setTimeout(() => {
      window.print()
    }, 250)
  }

  // Print Bulk Cards
  const handlePrintBulk = () => {
    setIsBulkPrinting(true)
    setTimeout(() => {
      window.print()
      setIsBulkPrinting(false)
    }, 400)
  }

  // Export CSV
  const handleExportCSV = () => {
    const list = selectedIds.size > 0 
      ? members.filter(m => selectedIds.has(m.id))
      : filteredData

    const header = 'ID,Name,Role,Class/Designation,Section/Department,Session,Contact,Blood Group,Design\n'
    const rows = list.map(m => 
      `"${m.uniqueId}","${m.name}","${m.role}","${m.className}","${m.section}","${m.session}","${m.contact}","${m.bloodGroup || ''}","Design ${m.designId}"`
    ).join('\n')

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `ID_Cards_${roleFilter}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const selectedMembers = useMemo(() => {
    return members.filter(m => selectedIds.has(m.id))
  }, [members, selectedIds])

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-300">
      
      {/* ─── PRINT-ONLY VIEW (Hidden on Screen, Shown when printing) ─── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible !important;
          }
          #print-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            z-index: 999999 !important;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

      <div id="print-section" className="hidden print:block">
        <div className="flex flex-wrap gap-8 items-start justify-center">
          {isBulkPrinting ? (
            selectedMembers.map(item => (
              <div key={item.id} className="p-2 border border-dashed border-slate-300 rounded-xl mb-4 break-inside-avoid">
                {item.role === 'Student' && item.designId === 1 && (
                  <StudentDesignVertical data={{ name: item.name, class: item.className, rollNo: item.uniqueId, phone: item.contact, bloodGroup: item.bloodGroup }} />
                )}
                {item.role === 'Student' && item.designId === 2 && (
                  <StudentDesignHorizontal data={{ name: item.name, class: item.className, rollNo: item.uniqueId, phone: item.contact, bloodGroup: item.bloodGroup }} />
                )}
                {item.role === 'Teacher' && item.designId === 1 && (
                  <TeacherDesignVertical data={{ name: item.name, designation: item.className, department: item.section, empId: item.uniqueId, phone: item.contact, bloodGroup: item.bloodGroup }} />
                )}
                {item.role === 'Teacher' && item.designId === 2 && (
                  <TeacherDesignHorizontal data={{ name: item.name, designation: item.className, department: item.section, empId: item.uniqueId, phone: item.contact, bloodGroup: item.bloodGroup }} />
                )}
                {item.role === 'Employee' && item.designId === 1 && (
                  <EmployeeDesignVertical data={{ name: item.name, designation: item.className, department: item.section, empId: item.uniqueId, phone: item.contact, bloodGroup: item.bloodGroup }} />
                )}
                {item.role === 'Employee' && item.designId === 2 && (
                  <EmployeeDesignHorizontal data={{ name: item.name, designation: item.className, department: item.section, empId: item.uniqueId, phone: item.contact, bloodGroup: item.bloodGroup }} />
                )}
              </div>
            ))
          ) : previewMember ? (
            <div className="p-2 break-inside-avoid">
              {previewMember.role === 'Student' && modalDesignId === 1 && (
                <StudentDesignVertical data={{ name: previewMember.name, class: previewMember.className, rollNo: previewMember.uniqueId, phone: previewMember.contact, bloodGroup: previewMember.bloodGroup }} />
              )}
              {previewMember.role === 'Student' && modalDesignId === 2 && (
                <StudentDesignHorizontal data={{ name: previewMember.name, class: previewMember.className, rollNo: previewMember.uniqueId, phone: previewMember.contact, bloodGroup: previewMember.bloodGroup }} />
              )}
              {previewMember.role === 'Teacher' && modalDesignId === 1 && (
                <TeacherDesignVertical data={{ name: previewMember.name, designation: previewMember.className, department: previewMember.section, empId: previewMember.uniqueId, phone: previewMember.contact, bloodGroup: previewMember.bloodGroup }} />
              )}
              {previewMember.role === 'Teacher' && modalDesignId === 2 && (
                <TeacherDesignHorizontal data={{ name: previewMember.name, designation: previewMember.className, department: previewMember.section, empId: previewMember.uniqueId, phone: previewMember.contact, bloodGroup: previewMember.bloodGroup }} />
              )}
              {previewMember.role === 'Employee' && modalDesignId === 1 && (
                <EmployeeDesignVertical data={{ name: previewMember.name, designation: previewMember.className, department: previewMember.section, empId: previewMember.uniqueId, phone: previewMember.contact, bloodGroup: previewMember.bloodGroup }} />
              )}
              {previewMember.role === 'Employee' && modalDesignId === 2 && (
                <EmployeeDesignHorizontal data={{ name: previewMember.name, designation: previewMember.className, department: previewMember.section, empId: previewMember.uniqueId, phone: previewMember.contact, bloodGroup: previewMember.bloodGroup }} />
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* ─── SCREEN VIEW ─── */}
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>ID Card Download & Print</span>
            <span className="text-xs bg-teal-50 dark:bg-teal-900/40 text-teal-600 px-2.5 py-0.5 rounded-full font-bold">
              {filteredData.length} Added Members
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Download and print specialized ID cards for registered Students, Teachers, and Employees
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Roll/ID, Class..." 
              className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 dark:text-slate-200"
            />
          </div>
          
          <button 
            onClick={loadAddedPeople}
            title="Refresh added members"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={handleExportCSV}
            title="Export CSV"
            className="px-3.5 h-9 flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-xs text-xs font-bold"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button 
            onClick={() => {
              if (selectedIds.size === 0) {
                // Select all and print
                setSelectedIds(new Set(filteredData.map(m => m.id)))
              }
              handlePrintBulk()
            }}
            title="Download / Print ID Cards"
            className="px-4 h-9 flex items-center gap-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm text-xs font-bold"
          >
            <Printer className="w-4 h-4" />
            <span>Print Cards</span>
          </button>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        {(['All', 'Student', 'Teacher', 'Employee'] as const).map(role => {
          const isActive = roleFilter === role
          const count = roleCounts[role]

          return (
            <button
              key={role}
              onClick={() => {
                setRoleFilter(role)
                setClassFilter('All Classes')
              }}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition-all shadow-sm flex items-center gap-2 ${
                isActive
                  ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-600/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {role === 'Student' && <GraduationCap className="w-3.5 h-3.5" />}
              {role === 'Teacher' && <UserCheck className="w-3.5 h-3.5" />}
              {role === 'Employee' && <Briefcase className="w-3.5 h-3.5" />}
              <span>{role === 'All' ? 'All Members' : `${role}s`}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filters Row */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Class / Designation Filter */}
          <select 
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option>All Classes</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          {/* Section / Branch Filter */}
          <select 
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option>All Sections</option>
            {availableSections.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>

          {/* Design Filter */}
          <select 
            value={designFilter}
            onChange={(e) => setDesignFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option>All Designs</option>
            <option>Design 1 (Vertical)</option>
            <option>Design 2 (Horizontal)</option>
          </select>

          {/* Session Filter */}
          <select 
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option>All Sessions</option>
            <option>2024-25</option>
            <option>2025-26</option>
            <option>2026-27</option>
          </select>

          {(classFilter !== 'All Classes' || sectionFilter !== 'All Sections' || designFilter !== 'All Designs' || sessionFilter !== 'All Sessions' || searchQuery) && (
            <button
              onClick={() => {
                setClassFilter('All Classes')
                setSectionFilter('All Sections')
                setDesignFilter('All Designs')
                setSessionFilter('All Sessions')
                setSearchQuery('')
              }}
              className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Selected Count Indicator */}
        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredData.length}</strong> matching records
        </div>
      </div>

      {/* Bulk Action Bar (When items are selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl px-4 py-3 flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="bg-teal-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
              {selectedIds.size} Selected
            </span>
            <span className="text-xs text-teal-900 dark:text-teal-200 font-medium">
              Ready for batch printing or CSV export
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintBulk}
              className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print {selectedIds.size} ID Cards</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200 hover:bg-teal-100 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected CSV</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-4 w-10 text-center">
                  <button 
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-teal-600"
                    title={selectedIds.size === filteredData.length ? 'Deselect All' : 'Select All'}
                  >
                    {filteredData.length > 0 && selectedIds.size === filteredData.length ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-4 text-left">S. No.</th>
                <th className="px-4 py-4 text-left">Member Name & ID</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4 text-left">Class / Designation</th>
                <th className="px-4 py-4 text-left">Section / Dept</th>
                <th className="px-4 py-4">Session</th>
                <th className="px-4 py-4">ID Card Design</th>
                <th className="px-4 py-4">Added Date</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <GraduationCap className="w-8 h-8 text-slate-300" />
                      <p className="font-bold text-sm text-slate-600">No members found</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, i) => {
                  const isSelected = selectedIds.has(item.id)

                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors ${
                        isSelected ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-4 text-center">
                        <button 
                          onClick={() => handleToggleSelect(item.id)}
                          className="text-slate-400 hover:text-teal-600 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* S. No */}
                      <td className="px-3 py-4 text-left text-slate-500 font-medium">
                        {i + 1}.
                      </td>

                      {/* Name & ID */}
                      <td className="px-4 py-4 text-left">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                            {item.avatar ? (
                              <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                                {item.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100">{item.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{item.uniqueId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          item.role === 'Student' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : item.role === 'Teacher' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {item.role}
                        </span>
                      </td>

                      {/* Class / Designation */}
                      <td className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                        {item.className}
                      </td>

                      {/* Section / Department */}
                      <td className="px-4 py-4 text-left text-slate-600 dark:text-slate-400">
                        {item.section}
                      </td>

                      {/* Session */}
                      <td className="px-4 py-4 text-slate-600 font-medium">
                        {item.session}
                      </td>

                      {/* ID Card Design Switcher */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleToggleDesign(item.id)}
                            title="Click to toggle between Design 1 (Vertical) and Design 2 (Horizontal)"
                            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-teal-500 hover:bg-teal-50/50 transition-all shadow-xs"
                          >
                            <span className={`w-2 h-2 rounded-full ${item.designId === 1 ? 'bg-sky-500' : 'bg-emerald-500'}`}></span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-teal-600">
                              Design {item.designId} ({item.designId === 1 ? 'Vertical' : 'Horizontal'})
                            </span>
                            <RotateCw className="w-2.5 h-2.5 text-slate-400 group-hover:text-teal-600 group-hover:rotate-180 transition-transform" />
                          </button>
                        </div>
                      </td>

                      {/* Generated Date */}
                      <td className="px-4 py-4 text-slate-500 text-[10px]">
                        🗓 {item.generatedAt}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenPreview(item)}
                            title="Preview ID Card Design"
                            className="w-7 h-7 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100 transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handlePrintSingle(item)}
                            title="Print / Download ID Card (PDF)"
                            className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100 transition-colors shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
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

        {/* Pagination & Summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-{filteredData.length} of {members.length} Total Added Records</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">»</button>
          </div>
        </div>
      </div>

      {/* ─── INTERACTIVE PREVIEW & DOWNLOAD MODAL ─── */}
      {previewMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
                  <span>{previewMember.name}</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                    {previewMember.role} • {previewMember.uniqueId}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {previewMember.className} • {previewMember.section} • Session {previewMember.session}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Front / Back Toggle */}
                <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => setPreviewSide('front')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewSide === 'front' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setPreviewSide('back')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewSide === 'back' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Back
                  </button>
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setPreviewMember(null)}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Design Selector Toolbar */}
            <div className="bg-slate-100 dark:bg-slate-900/80 px-6 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-300">
                Choose Design Version for {previewMember.role}:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalDesignId(1)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                    modalDesignId === 1 
                      ? 'bg-teal-600 text-white shadow-xs' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200'
                  }`}
                >
                  Design 1 (Vertical)
                </button>
                <button
                  onClick={() => setModalDesignId(2)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                    modalDesignId === 2 
                      ? 'bg-teal-600 text-white shadow-xs' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200'
                  }`}
                >
                  Design 2 (Horizontal)
                </button>
              </div>
            </div>

            {/* Card Render Container */}
            <div className="p-8 flex items-center justify-center bg-slate-100/70 dark:bg-slate-900/60 min-h-[470px]">
              <div 
                className="transition-transform duration-200 flex items-center justify-center"
                style={{ 
                  transform: modalDesignId === 2 ? 'scale(0.95)' : 'scale(0.92)',
                  transformOrigin: 'center' 
                }}
              >
                {previewSide === 'back' ? (
                  <IdCardBackDesign 
                    orientation={modalDesignId === 2 ? 'landscape' : 'portrait'}
                    schoolName="COSMOPOLITAN INTER COLLEGE"
                    schoolAddress="Knowledge Park, Sector 62, New Delhi"
                    schoolPhone="+91 11 2345 6789"
                  />
                ) : (
                  <>
                    {/* Render matching design */}
                    {previewMember.role === 'Student' && modalDesignId === 1 && (
                      <StudentDesignVertical 
                        data={{ 
                          name: previewMember.name, 
                          class: previewMember.className, 
                          rollNo: previewMember.uniqueId.slice(-2),
                          admNo: previewMember.uniqueId,
                          fatherName: previewMember.fatherName || 'Rajesh Sharma',
                          dob: previewMember.dob || '14/08/2010',
                          bloodGroup: previewMember.bloodGroup || 'O+',
                          phone: previewMember.contact,
                          photo: previewMember.avatar
                        }} 
                      />
                    )}
                    {previewMember.role === 'Student' && modalDesignId === 2 && (
                      <StudentDesignHorizontal 
                        data={{ 
                          name: previewMember.name, 
                          class: previewMember.className, 
                          rollNo: previewMember.uniqueId.slice(-2),
                          admNo: previewMember.uniqueId,
                          fatherName: previewMember.fatherName || 'Rajesh Sharma',
                          dob: previewMember.dob || '14/08/2010',
                          bloodGroup: previewMember.bloodGroup || 'O+',
                          phone: previewMember.contact,
                          photo: previewMember.avatar
                        }} 
                      />
                    )}

                    {previewMember.role === 'Teacher' && modalDesignId === 1 && (
                      <TeacherDesignVertical 
                        data={{ 
                          name: previewMember.name, 
                          designation: previewMember.className, 
                          department: previewMember.section,
                          empId: previewMember.uniqueId,
                          qualification: previewMember.qualification || 'M.Sc, M.Phil, Ph.D, B.Ed',
                          doj: previewMember.joiningDate || '12/07/2018',
                          bloodGroup: previewMember.bloodGroup || 'AB+',
                          phone: previewMember.contact,
                          photo: previewMember.avatar
                        }} 
                      />
                    )}
                    {previewMember.role === 'Teacher' && modalDesignId === 2 && (
                      <TeacherDesignHorizontal 
                        data={{ 
                          name: previewMember.name, 
                          designation: previewMember.className, 
                          department: previewMember.section,
                          empId: previewMember.uniqueId,
                          qualification: previewMember.qualification || 'M.A., M.Phil., UGC-NET, B.Ed',
                          bloodGroup: previewMember.bloodGroup || 'A+',
                          phone: previewMember.contact,
                          photo: previewMember.avatar
                        }} 
                      />
                    )}

                    {previewMember.role === 'Employee' && modalDesignId === 1 && (
                      <EmployeeDesignVertical 
                        data={{ 
                          name: previewMember.name, 
                          designation: previewMember.className, 
                          department: previewMember.section,
                          empId: previewMember.uniqueId,
                          doj: previewMember.joiningDate || '05/02/2020',
                          bloodGroup: previewMember.bloodGroup || 'A+',
                          phone: previewMember.contact,
                          photo: previewMember.avatar
                        }} 
                      />
                    )}
                    {previewMember.role === 'Employee' && modalDesignId === 2 && (
                      <EmployeeDesignHorizontal 
                        data={{ 
                          name: previewMember.name, 
                          designation: previewMember.className, 
                          department: previewMember.section,
                          empId: previewMember.uniqueId,
                          bloodGroup: previewMember.bloodGroup || 'O+',
                          phone: previewMember.contact,
                          photo: previewMember.avatar
                        }} 
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Standard CR80 300 DPI Format • Ready to Print
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save as PDF
                </button>
                <button
                  onClick={() => setPreviewMember(null)}
                  className="px-5 py-2.5 rounded-lg border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

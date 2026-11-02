'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, Plus, UserCheck, Printer, Trash2,
  MoreVertical, CheckCircle2, Shield, X, Loader2, Users, User,
  Calendar, Clock, ExternalLink, ArrowRight, ShieldCheck,
  CreditCard, Eye, AlertCircle, Phone, Car, MapPin, ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { fetchGatePasses, deleteGatePass } from '../actions'
import { useClasses, useSections } from '@/lib/mastersData'

const SAMPLE_PERMANENT_PASSES = [
  {
    id: 'perm_1',
    user_type: 'Student',
    student_name: 'Md Fahad',
    class_name: 'Class 10',
    section_name: 'A',
    roll_no: '01',
    admission_no: 'ADM-101',
    parent_name: 'Mohd Tariq',
    parents_mobile: '9876543210',
    receiver_name: 'Mohd Tariq',
    receiver_relation: 'Father',
    receiver_mobile: '9876543210',
    aadhar_no: '876543210987',
    valid_from: '2026-04-01',
    valid_to: '2027-03-31',
    entry_gate: 'Gate 1',
    exit_gate: 'Gate 2',
    status: 'Active',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-04-02 09:30 AM'
  },
  {
    id: 'perm_2',
    user_type: 'Visitor',
    visitor_name: 'Dr. Sunita Sharma',
    contact: '9812345678',
    parent_name: 'N/A',
    receiver_name: 'Dr. Sunita Sharma',
    receiver_relation: 'Visiting Doctor',
    receiver_mobile: '9812345678',
    aadhar_no: '765432109876',
    valid_from: '2026-06-01',
    valid_to: '2026-12-31',
    entry_gate: 'Main Gate',
    exit_gate: 'Main Gate',
    vehicle_no: 'DL 04 AB 9876',
    status: 'Active',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-06-01 10:15 AM'
  },
  {
    id: 'perm_3',
    user_type: 'Student',
    student_name: 'Ananya Roy',
    class_name: 'Class 8',
    section_name: 'B',
    roll_no: '05',
    admission_no: 'ADM-108',
    parent_name: 'Subhash Roy',
    parents_mobile: '9765432109',
    receiver_name: 'Rekha Roy',
    receiver_relation: 'Mother',
    receiver_mobile: '9765432109',
    aadhar_no: '654321098765',
    valid_from: '2026-04-01',
    valid_to: '2027-03-31',
    entry_gate: 'Gate 2',
    exit_gate: 'Gate 2',
    status: 'Active',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-04-05 11:45 AM'
  },
  {
    id: 'perm_4',
    user_type: 'Visitor',
    visitor_name: 'Ramesh Verma',
    contact: '9823456789',
    parent_name: 'N/A',
    receiver_name: 'Ramesh Verma',
    receiver_relation: 'IT Maintenance Vendor',
    receiver_mobile: '9823456789',
    aadhar_no: '654312348765',
    valid_from: '2026-05-01',
    valid_to: '2027-04-30',
    entry_gate: 'Main Gate',
    exit_gate: 'Main Gate',
    vehicle_no: 'UP 16 CD 4321',
    status: 'Active',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-05-01 11:00 AM'
  },
  {
    id: 'perm_5',
    user_type: 'Student',
    student_name: 'Aarav Sharma',
    class_name: 'Class 1',
    section_name: 'A',
    roll_no: '12',
    admission_no: 'ADM-012',
    parent_name: 'Amit Sharma',
    parents_mobile: '9876501234',
    receiver_name: 'Amit Sharma',
    receiver_relation: 'Father',
    receiver_mobile: '9876501234',
    aadhar_no: '987654321012',
    valid_from: '2026-04-01',
    valid_to: '2027-03-31',
    entry_gate: 'Gate 1',
    exit_gate: 'Gate 1',
    status: 'Active',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-04-10 10:00 AM'
  },
  {
    id: 'perm_6',
    user_type: 'Visitor',
    visitor_name: 'Rajesh Gupta',
    contact: '9834567890',
    parent_name: 'N/A',
    receiver_name: 'Rajesh Gupta',
    receiver_relation: 'CCTV & Security Vendor',
    receiver_mobile: '9834567890',
    aadhar_no: '432187651234',
    valid_from: '2026-06-15',
    valid_to: '2027-06-14',
    entry_gate: 'Main Gate',
    exit_gate: 'Main Gate',
    vehicle_no: 'DL 01 XY 7788',
    status: 'Active',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-06-15 02:00 PM'
  }
]

export default function PermanentGatePassPage() {
  const classesData = useClasses()
  const sectionsData = useSections()

  const [passes, setPasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ── Two Search Tabs: Student Relative vs Not a Relative ──
  const [userTab, setUserTab] = useState<'student' | 'visitor'>('student')

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Expired'>('All')

  // Modals & Actions
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [detailsModalPass, setDetailsModalPass] = useState<any | null>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })

  // Load passes from database and localStorage
  useEffect(() => {
    async function load() {
      setLoading(true)
      const parseLocal = (key: string) => {
        try {
          const raw = localStorage.getItem(key)
          return raw ? JSON.parse(raw) : []
        } catch {
          return []
        }
      }

      try {
        const localPasses = parseLocal('school_gate_passes').filter((p: any) => (p.passType || p.pass_type) === 'permanent')
        const res = await fetchGatePasses('permanent')
        const dbPasses = (res?.success && Array.isArray(res.data)) ? res.data : []
        const dbIds = new Set(dbPasses.map((p: any) => String(p.id)))
        const uniqueLocal = localPasses.filter((p: any) => !dbIds.has(String(p.id)))
        let rawCombined = [...dbPasses, ...uniqueLocal]

        if (rawCombined.length === 0) {
          rawCombined = SAMPLE_PERMANENT_PASSES
        } else {
          // If either category is missing, merge samples so both tabs have data readily available
          const hasVisitor = rawCombined.some(p => String(p.user_type || p.userType).toLowerCase() === 'visitor' || (!p.student_name && p.receiver_name))
          const hasStudent = rawCombined.some(p => String(p.user_type || p.userType).toLowerCase() === 'student' || Boolean(p.student_name))
          if (!hasVisitor) {
            rawCombined = [...rawCombined, ...SAMPLE_PERMANENT_PASSES.filter(p => p.user_type === 'Visitor')]
          }
          if (!hasStudent) {
            rawCombined = [...rawCombined, ...SAMPLE_PERMANENT_PASSES.filter(p => p.user_type === 'Student')]
          }
        }

        // Normalize each pass
        const normalized = rawCombined.map(p => ({
          ...p,
          id: p.id || `perm-${Math.random()}`,
          user_type: p.user_type || p.userType || (p.student_name || p.studentName ? 'Student' : 'Visitor'),
          student_name: p.student_name || p.studentName || '',
          class_name: p.class_name || p.className || '',
          section_name: p.section_name || p.sectionName || '',
          roll_no: String(p.roll_no || p.rollNo || ''),
          admission_no: p.admission_no || p.admissionNo || '',
          visitor_name: p.visitor_name || p.visitorName || '',
          receiver_name: p.receiver_name || p.receiverName || p.visitor_name || p.visitorName || '',
          receiver_mobile: p.receiver_mobile || p.receiverMobile || p.contact || p.parents_mobile || p.visitorMobile || '',
          receiver_relation: p.receiver_relation || p.receiverRelation || (String(p.user_type || p.userType).toLowerCase() === 'visitor' ? 'Permanent Visitor' : 'Authorized Relative'),
          photo_url: p.photo_url || p.photoUrl || '',
          aadhar_no: p.aadhar_no || p.aadharNo || '',
          valid_from: p.valid_from || p.validFrom || '',
          valid_to: p.valid_to || p.validTo || '',
          vehicle_no: p.vehicle_no || p.vehicleNo || '',
          entry_gate: p.entry_gate || p.entryGate || 'Main Gate',
          exit_gate: p.exit_gate || p.exitGate || 'Main Gate',
          status: p.status || 'Active',
          created_at: p.created_at || new Date().toISOString()
        }))

        setPasses(normalized)
      } catch (e) {
        console.error(e)
        setPasses(SAMPLE_PERMANENT_PASSES)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ open: true, msg, type })
    setTimeout(() => setToast(p => ({ ...p, open: false })), 3000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permanent gate pass?')) return
    try {
      await deleteGatePass(id)
    } catch {}

    // Update state and local storage
    setPasses(prev => prev.filter(p => String(p.id) !== String(id)))
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('school_gate_passes')
        if (raw) {
          const parsed = JSON.parse(raw)
          const filtered = parsed.filter((p: any) => String(p.id) !== String(id))
          localStorage.setItem('school_gate_passes', JSON.stringify(filtered))
        }
      } catch {}
    }
    setActionMenuId(null)
    showToast('Permanent gate pass deleted successfully!', 'success')
  }

  // ── Class Options (from Master & Passes) ──
  const classOptions = useMemo(() => {
    const set = new Set<string>()
    if (Array.isArray(classesData)) {
      classesData.forEach((c: any) => {
        if (!c.deleted) {
          const name = c.className || c.name
          if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
        }
      })
    }
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('school_masters_classes')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            parsed.forEach((c: any) => {
              if (!c.deleted) {
                const name = c.className || c.name
                if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
              }
            })
          }
        }
      } catch (e) {}
    }
    passes.forEach(p => {
      const name = p.class_name || p.className
      if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
    })
    return Array.from(set).sort()
  }, [classesData, passes])

  // ── Section Options (from Master & Passes filtered by selectedClass) ──
  const sectionOptions = useMemo(() => {
    const set = new Set<string>()
    const targetNorm = selectedClass.trim().toLowerCase()

    if (Array.isArray(sectionsData)) {
      sectionsData.forEach((s: any) => {
        if (!s.deleted) {
          const sClass = (s.className || s.class || '').trim().toLowerCase()
          if (!selectedClass || !sClass || sClass === targetNorm) {
            const name = s.sectionName || s.name
            if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
          }
        }
      })
    }
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('school_masters_sections')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            parsed.forEach((s: any) => {
              if (!s.deleted) {
                const sClass = (s.className || s.class || '').trim().toLowerCase()
                if (!selectedClass || !sClass || sClass === targetNorm) {
                  const name = s.sectionName || s.name
                  if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
                }
              }
            })
          }
        }
      } catch (e) {}
    }
    passes.forEach(p => {
      const pClass = (p.class_name || p.className || '').trim().toLowerCase()
      if (!selectedClass || !pClass || pClass === targetNorm) {
        const name = p.section_name || p.sectionName
        if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
      }
    })
    return Array.from(set).sort()
  }, [sectionsData, passes, selectedClass])

  // ── Summary Metrics ──
  const metrics = useMemo(() => {
    const total = passes.length
    const today = new Date()
    const activeCount = passes.filter(p => {
      if (!p.valid_to) return true
      const d = new Date(p.valid_to)
      return d >= today
    }).length
    const studentCount = passes.filter(p => {
      const uType = String(p.user_type || p.userType || '').toLowerCase()
      return uType === 'student' || Boolean(p.student_name && !p.visitor_name)
    }).length
    const visitorCount = total - studentCount
    return { total, activeCount, studentCount, visitorCount }
  }, [passes])

  // ── Filtered List ──
  const filtered = useMemo(() => {
    const today = new Date()
    return passes.filter(p => {
      const isStudent = String(p.user_type || p.userType || '').toLowerCase() === 'student' || Boolean(p.student_name && !p.visitor_name)

      // 1. Tab check
      if (userTab === 'student' && !isStudent) return false
      if (userTab === 'visitor' && isStudent) return false

      // 2. Class & Section check (Only for Student Relative tab)
      if (userTab === 'student') {
        if (selectedClass) {
          const pClass = String(p.class_name || p.className || '').trim().toLowerCase()
          if (!pClass.includes(selectedClass.trim().toLowerCase())) return false
        }
        if (selectedSection) {
          const pSec = String(p.section_name || p.sectionName || '').trim().toLowerCase()
          if (pSec !== selectedSection.trim().toLowerCase()) return false
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const sName = String(p.student_name || '').toLowerCase()
        const vName = String(p.visitor_name || '').toLowerCase()
        const rName = String(p.receiver_name || '').toLowerCase()
        const rRel = String(p.receiver_relation || '').toLowerCase()
        const rMob = String(p.receiver_mobile || p.contact || '').toLowerCase()
        const aadhar = String(p.aadhar_no || '').toLowerCase()
        const roll = String(p.roll_no || '').toLowerCase()
        const adm = String(p.admission_no || '').toLowerCase()
        const veh = String(p.vehicle_no || '').toLowerCase()

        const match = sName.includes(q) || vName.includes(q) || rName.includes(q) ||
                      rRel.includes(q) || rMob.includes(q) || aadhar.includes(q) ||
                      roll.includes(q) || adm.includes(q) || veh.includes(q)
        if (!match) return false
      }

      // 4. Status filter
      if (filterStatus !== 'All') {
        const isExp = p.valid_to ? new Date(p.valid_to) < today : false
        if (filterStatus === 'Active' && isExp) return false
        if (filterStatus === 'Expired' && !isExp) return false
      }

      return true
    })
  }, [passes, userTab, selectedClass, selectedSection, searchQuery, filterStatus])

  const fmtDate = (val: any) => {
    if (!val) return '—'
    try {
      const d = new Date(val)
      if (isNaN(d.getTime())) return String(val)
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return String(val)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-300">

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-[#1b3a60] to-teal-700 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black tracking-tight">Permanent Visitor List</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/20 text-white border border-white/20">
              {passes.length} registered
            </span>
          </div>
          <p className="text-xs text-teal-100 mt-1">
            Search and manage long-term verified permanent visitors: authorized student relatives and non-relative visitors (vendors, contractors, official personnel).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/institute/gate-pass/permanent-registration"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-teal-900 hover:bg-teal-50 rounded-xl text-xs font-black shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Register Permanent Pass</span>
          </Link>
        </div>
      </div>

      {/* ── OVERVIEW METRIC STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Permanent Passes</span>
            <Shield className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.total}</p>
          <span className="text-[11px] text-teal-600 font-semibold">Registered ID cards</span>
        </div>

        <div
          onClick={() => { setUserTab('student'); setSelectedClass(''); setSelectedSection(''); }}
          className={`bg-white dark:bg-slate-800 border rounded-2xl p-4 shadow-xs cursor-pointer transition-all ${
            userTab === 'student' ? 'border-purple-400 ring-2 ring-purple-100 dark:ring-purple-900/40' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Student&apos;s Relatives</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1.5">{metrics.studentCount}</p>
          <span className="text-[11px] text-purple-600 font-semibold">Authorized student guardians</span>
        </div>

        <div
          onClick={() => { setUserTab('visitor'); setSelectedClass(''); setSelectedSection(''); }}
          className={`bg-white dark:bg-slate-800 border rounded-2xl p-4 shadow-xs cursor-pointer transition-all ${
            userTab === 'visitor' ? 'border-amber-400 ring-2 ring-amber-100 dark:ring-amber-900/40' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Not a Relative (Vendors/Staff)</span>
            <User className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1.5">{metrics.visitorCount}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Contractors, doctors & vendors</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Active Valid Passes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">{metrics.activeCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Within validity date</span>
        </div>
      </div>

      {/* ── TWO TABS: STUDENT RELATIVE vs NOT A RELATIVE ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-sm flex gap-2">
        <button
          type="button"
          onClick={() => {
            setUserTab('student')
            setSelectedClass('')
            setSelectedSection('')
          }}
          className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
            userTab === 'student'
              ? 'bg-gradient-to-r from-[#1b3a60] to-teal-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student&apos;s Relative</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            userTab === 'student' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}>
            {metrics.studentCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setUserTab('visitor')
            setSelectedClass('')
            setSelectedSection('')
          }}
          className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
            userTab === 'visitor'
              ? 'bg-gradient-to-r from-[#1b3a60] to-teal-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Not a Relative (Permanent Visitor)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            userTab === 'visitor' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}>
            {metrics.visitorCount}
          </span>
        </button>
      </div>

      {/* ── SEARCH & FILTER TOOLBAR ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder={
                  userTab === 'student'
                    ? "Search student name, roll no, relative, phone, Aadhar..."
                    : "Search visitor name, role / vendor, phone, vehicle, Aadhar..."
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 outline-none focus:border-teal-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Class & Section Filters — ONLY FOR STUDENT RELATIVE TAB */}
            {userTab === 'student' && (
              <>
                {/* Class Dropdown */}
                <div className="relative min-w-[140px]">
                  <select
                    value={selectedClass}
                    onChange={e => {
                      setSelectedClass(e.target.value)
                      setSelectedSection('')
                    }}
                    className="w-full appearance-none pl-3.5 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <option value="">All Classes</option>
                    {classOptions.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Section Dropdown */}
                <div className="relative min-w-[130px]">
                  <select
                    value={selectedSection}
                    onChange={e => setSelectedSection(e.target.value)}
                    disabled={!selectedClass}
                    className="w-full appearance-none pl-3.5 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500 cursor-pointer text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Sections</option>
                    {sectionOptions.map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {(selectedClass || selectedSection) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClass('')
                      setSelectedSection('')
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-red-500 px-2 py-1 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear Class/Sec
                  </button>
                )}
              </>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
            {(['All', 'Active', 'Expired'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filter Badges */}
        {(selectedClass || selectedSection || searchQuery || filterStatus !== 'All') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex-wrap text-xs">
            <span className="text-slate-400 font-bold text-[11px]">Active Filters:</span>
            {userTab === 'student' && selectedClass && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold">
                Class: {selectedClass}
                <button type="button" onClick={() => setSelectedClass('')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {userTab === 'student' && selectedSection && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold">
                Section: {selectedSection}
                <button type="button" onClick={() => setSelectedSection('')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
                &ldquo;{searchQuery}&rdquo;
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterStatus !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                Status: {filterStatus}
                <button type="button" onClick={() => setFilterStatus('All')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedClass('')
                setSelectedSection('')
                setSearchQuery('')
                setFilterStatus('All')
              }}
              className="text-xs text-red-500 hover:underline font-bold ml-auto"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
            <span className="text-sm font-bold">Loading permanent passes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto font-semibold text-xs">
            <table className="w-full text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                {userTab === 'student' ? (
                  /* TABLE HEADER: STUDENT'S RELATIVE */
                  <tr>
                    <th className="px-3.5 py-3.5 w-12">#</th>
                    <th className="px-3.5 py-3.5 text-left">Student Information</th>
                    <th className="px-3.5 py-3.5 text-left">Authorized Relative</th>
                    <th className="px-3.5 py-3.5">Relation</th>
                    <th className="px-3.5 py-3.5">Aadhar Card No.</th>
                    <th className="px-3.5 py-3.5 w-14">Photo</th>
                    <th className="px-3.5 py-3.5">Validity Period</th>
                    <th className="px-3.5 py-3.5">Gate Access</th>
                    <th className="px-3.5 py-3.5">Status</th>
                    <th className="px-3.5 py-3.5 w-16 text-right pr-4">Action</th>
                  </tr>
                ) : (
                  /* TABLE HEADER: NOT A RELATIVE (VENDOR / VISITOR) */
                  <tr>
                    <th className="px-3.5 py-3.5 w-12">#</th>
                    <th className="px-3.5 py-3.5 text-left">Visitor Name</th>
                    <th className="px-3.5 py-3.5 text-left">Designation / Role</th>
                    <th className="px-3.5 py-3.5">Contact Mobile</th>
                    <th className="px-3.5 py-3.5">Vehicle No.</th>
                    <th className="px-3.5 py-3.5">Aadhar / ID No.</th>
                    <th className="px-3.5 py-3.5 w-14">Photo</th>
                    <th className="px-3.5 py-3.5">Validity Period</th>
                    <th className="px-3.5 py-3.5">Gate Access</th>
                    <th className="px-3.5 py-3.5">Status</th>
                    <th className="px-3.5 py-3.5 w-16 text-right pr-4">Action</th>
                  </tr>
                )}
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((item, idx) => {
                  const today = new Date()
                  const isExpired = item.valid_to ? new Date(item.valid_to) < today : false

                  if (userTab === 'student') {
                    // ── ROW: STUDENT'S RELATIVE ──
                    const studentName = item.student_name || '—'
                    const receiverName = item.receiver_name || item.parent_name || '—'

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors align-middle">
                        <td className="px-3.5 py-3.5 text-slate-400 font-mono">
                          {String(idx + 1).padStart(2, '0')}.
                        </td>

                        {/* Student Info */}
                        <td className="px-3.5 py-3.5 text-left whitespace-nowrap">
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">{studentName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                              {item.class_name || 'Class —'} {item.section_name && `(${item.section_name})`}
                            </span>
                            {item.roll_no && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Roll: <strong className="text-slate-600 dark:text-slate-300">{item.roll_no}</strong>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Authorized Relative */}
                        <td className="px-3.5 py-3.5 text-left font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          <p>{receiverName}</p>
                          {item.receiver_mobile && (
                            <span className="text-[10px] font-normal text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {item.receiver_mobile}
                            </span>
                          )}
                        </td>

                        {/* Relation */}
                        <td className="px-3.5 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {item.receiver_relation || 'Parent / Relative'}
                          </span>
                        </td>

                        {/* Aadhar No */}
                        <td className="px-3.5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs whitespace-nowrap">
                          {item.aadhar_no ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              •••• {item.aadhar_no.slice(-4)}
                            </span>
                          ) : '—'}
                        </td>

                        {/* Photo */}
                        <td className="px-3.5 py-3.5">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt="receiver" className="w-9 h-9 rounded-xl object-cover mx-auto ring-2 ring-teal-400/50 shadow-xs" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 mx-auto flex items-center justify-center text-xs font-bold">
                              {(receiverName).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>

                        {/* Validity */}
                        <td className="px-3.5 py-3.5 whitespace-nowrap text-[11px] text-slate-600 dark:text-slate-300">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3 text-teal-600 shrink-0" />
                            <span>{fmtDate(item.valid_from)} - {fmtDate(item.valid_to)}</span>
                          </div>
                        </td>

                        {/* Gate Access */}
                        <td className="px-3.5 py-3.5 text-slate-600 dark:text-slate-300 font-bold text-xs">
                          {item.entry_gate || '1'} • {item.exit_gate || '2'}
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            !isExpired
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${!isExpired ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {!isExpired ? 'Active' : 'Expired'}
                          </span>
                        </td>

                        {/* Action Menu */}
                        <td className="px-3.5 py-3.5 text-right pr-4 relative">
                          <button
                            type="button"
                            onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 ml-auto transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
                          </button>

                          {actionMenuId === item.id && (
                            <div className="absolute right-4 top-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1 w-36 animate-in fade-in zoom-in-95 duration-150 text-left">
                              <button
                                type="button"
                                onClick={() => { setDetailsModalPass(item); setActionMenuId(null); }}
                                className="flex items-center gap-2 px-3.5 py-2 w-full hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                              >
                                <Eye className="w-3.5 h-3.5 text-teal-600" /> View Details
                              </button>
                              <Link
                                href={`/institute/gate-pass/print?id=${item.id}&type=permanent`}
                                className="flex items-center gap-2 px-3.5 py-2 w-full hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                              >
                                <Printer className="w-3.5 h-3.5 text-blue-500" /> Print Card
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="flex items-center gap-2 px-3.5 py-2 w-full hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  } else {
                    // ── ROW: NOT A RELATIVE (VENDOR / VISITOR) ──
                    const visitorName = item.visitor_name || item.receiver_name || '—'
                    const role = item.receiver_relation || item.designation || 'Permanent Visitor'

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors align-middle">
                        <td className="px-3.5 py-3.5 text-slate-400 font-mono">
                          {String(idx + 1).padStart(2, '0')}.
                        </td>

                        {/* Visitor Name */}
                        <td className="px-3.5 py-3.5 text-left whitespace-nowrap">
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">{visitorName}</p>
                          <span className="text-[10.5px] text-slate-400 font-semibold">
                            Permanent Non-Relative Pass
                          </span>
                        </td>

                        {/* Role / Designation */}
                        <td className="px-3.5 py-3.5 text-left whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            {role}
                          </span>
                        </td>

                        {/* Contact Mobile */}
                        <td className="px-3.5 py-3.5 text-slate-700 dark:text-slate-200 font-bold whitespace-nowrap">
                          {item.receiver_mobile || item.contact ? (
                            <span className="flex items-center justify-center gap-1 font-mono text-xs">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {item.receiver_mobile || item.contact}
                            </span>
                          ) : '—'}
                        </td>

                        {/* Vehicle No */}
                        <td className="px-3.5 py-3.5 font-mono text-xs uppercase font-bold text-slate-700 dark:text-slate-300">
                          {item.vehicle_no ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                              <Car className="w-3 h-3 text-slate-400" />
                              {item.vehicle_no}
                            </span>
                          ) : '—'}
                        </td>

                        {/* Aadhar / ID No */}
                        <td className="px-3.5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs whitespace-nowrap">
                          {item.aadhar_no ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              •••• {item.aadhar_no.slice(-4)}
                            </span>
                          ) : '—'}
                        </td>

                        {/* Photo */}
                        <td className="px-3.5 py-3.5">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt="visitor" className="w-9 h-9 rounded-xl object-cover mx-auto ring-2 ring-amber-400/50 shadow-xs" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 mx-auto flex items-center justify-center text-xs font-bold">
                              {(visitorName).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>

                        {/* Validity */}
                        <td className="px-3.5 py-3.5 whitespace-nowrap text-[11px] text-slate-600 dark:text-slate-300">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3 text-teal-600 shrink-0" />
                            <span>{fmtDate(item.valid_from)} - {fmtDate(item.valid_to)}</span>
                          </div>
                        </td>

                        {/* Gate Access */}
                        <td className="px-3.5 py-3.5 text-slate-600 dark:text-slate-300 font-bold text-xs">
                          {item.entry_gate || 'Main Gate'}
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            !isExpired
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${!isExpired ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {!isExpired ? 'Active' : 'Expired'}
                          </span>
                        </td>

                        {/* Action Menu */}
                        <td className="px-3.5 py-3.5 text-right pr-4 relative">
                          <button
                            type="button"
                            onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 ml-auto transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
                          </button>

                          {actionMenuId === item.id && (
                            <div className="absolute right-4 top-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1 w-36 animate-in fade-in zoom-in-95 duration-150 text-left">
                              <button
                                type="button"
                                onClick={() => { setDetailsModalPass(item); setActionMenuId(null); }}
                                className="flex items-center gap-2 px-3.5 py-2 w-full hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                              >
                                <Eye className="w-3.5 h-3.5 text-teal-600" /> View Details
                              </button>
                              <Link
                                href={`/institute/gate-pass/print?id=${item.id}&type=permanent`}
                                className="flex items-center gap-2 px-3.5 py-2 w-full hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                              >
                                <Printer className="w-3.5 h-3.5 text-blue-500" /> Print Card
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="flex items-center gap-2 px-3.5 py-2 w-full hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  }
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={userTab === 'student' ? 10 : 11} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <ShieldCheck className="w-7 h-7 text-slate-300 dark:text-slate-500" />
                        </div>
                        <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                          {userTab === 'student'
                            ? 'No student relative gate passes found.'
                            : 'No non-relative permanent visitors found.'}
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          {userTab === 'student'
                            ? (selectedClass || selectedSection || searchQuery
                                ? 'Try clearing your class, section or search filters to find registered relatives.'
                                : 'Register verified relatives or guardians who have permanent student pickup permission.')
                            : (searchQuery
                                ? 'Try searching with a different visitor name or contact phone.'
                                : 'Register permanent non-relative visitors such as visiting doctors, maintenance vendors, and canteen contractors.')}
                        </p>
                        <Link
                          href="/institute/gate-pass/permanent-registration"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-teal-700 transition-colors mt-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>
                            {userTab === 'student' ? 'Register Student Relative Pass' : 'Register Permanent Visitor Pass'}
                          </span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DETAILS MODAL ── */}
      {detailsModalPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-[#1b3a60] to-teal-700 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">
                  {detailsModalPass.user_type === 'Student' ? 'Student Relative Pass Details' : 'Permanent Visitor Pass Details'}
                </h3>
                <p className="text-xs text-teal-100 mt-0.5">Verified Identity & Access Privileges</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalPass(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-semibold">
              <div className="flex items-center gap-4 p-4 bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-900/60">
                {detailsModalPass.photo_url ? (
                  <img src={detailsModalPass.photo_url} alt="Photo" className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500 shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shrink-0">
                    {(detailsModalPass.receiver_name || detailsModalPass.visitor_name || 'V').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {detailsModalPass.receiver_name || detailsModalPass.visitor_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-600 text-white">
                      {detailsModalPass.receiver_relation || detailsModalPass.designation || 'Permanent Visitor'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {detailsModalPass.receiver_mobile || detailsModalPass.contact}
                    </span>
                  </div>
                </div>
              </div>

              {detailsModalPass.user_type === 'Student' && detailsModalPass.student_name && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Associated Student</p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{detailsModalPass.student_name}</p>
                  <p className="text-slate-500">
                    Class: <span className="font-bold text-slate-700 dark:text-slate-300">{detailsModalPass.class_name} ({detailsModalPass.section_name})</span>
                    {detailsModalPass.roll_no && <> &nbsp;|&nbsp; Roll: <span className="font-bold text-slate-700 dark:text-slate-300">{detailsModalPass.roll_no}</span></>}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Aadhar / ID No.</p>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {detailsModalPass.aadhar_no || '—'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Vehicle No.</p>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 uppercase">
                    {detailsModalPass.vehicle_no || '—'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Validity Period</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {fmtDate(detailsModalPass.valid_from)} - {fmtDate(detailsModalPass.valid_to)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Gate Access</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {detailsModalPass.entry_gate || 'Main'} &rarr; {detailsModalPass.exit_gate || 'Main'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
              <Link
                href={`/institute/gate-pass/print?id=${detailsModalPass.id}&type=permanent`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
              >
                <Printer className="w-3.5 h-3.5" /> Print Card
              </Link>
              <button
                type="button"
                onClick={() => setDetailsModalPass(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast.open && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-red-200" />}
          <span className="text-xs font-bold">{toast.msg}</span>
        </div>
      )}
    </div>
  )
}

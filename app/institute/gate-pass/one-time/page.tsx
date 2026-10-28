'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  ArrowLeft, Camera, X, CheckCircle2,
  ChevronDown, Users, User, Loader2, Phone,
  Clock, Calendar, Shield
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchStudents } from '@/app/institute/students/actions'
import { createOneTimeGatePass } from '@/app/institute/gate-pass/actions'
import { useClasses, useSections } from '@/lib/mastersData'

type GatePassTab = 'student' | 'visitor'

export default function OneTimeGatePassPage() {
  const router = useRouter()
  const classesData = useClasses()
  const sectionsData = useSections()

  const [tab, setTab] = useState<GatePassTab>('student')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })

  // Real students from DB
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [studentsLoading, setStudentsLoading] = useState(true)

  // ---------- STUDENT TAB FIELDS ----------
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [parentsMobile, setParentsMobile] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [receiverName, setReceiverName] = useState('')
  const [receiverMobile, setReceiverMobile] = useState('')
  const [receiverRelation, setReceiverRelation] = useState('')
  const [vehicleNo, setVehicleNo] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // ---------- VISITOR TAB FIELDS ----------
  const [visitorName, setVisitorName] = useState('')
  const [visitorMobile, setVisitorMobile] = useState('')

  // ---------- COMMON VISIT DETAILS ----------
  const [visitDate, setVisitDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [visitTime, setVisitTime] = useState(() => {
    const now = new Date()
    return now.toTimeString().slice(0, 5)
  })
  const [entryGate, setEntryGate] = useState('')
  const [exitGate, setExitGate] = useState('')
  const [reason, setReason] = useState('')
  const [remarks, setRemarks] = useState('')

  // Load real students
  useEffect(() => {
    async function load() {
      setStudentsLoading(true)
      const parseLocal = (key: string) => {
        try {
          const raw = localStorage.getItem(key)
          return raw ? JSON.parse(raw) : []
        } catch {
          return []
        }
      }
      const localStudents = [
        ...parseLocal('school_students'),
        ...parseLocal('school_institute_students'),
        ...parseLocal('students')
      ]
      try {
        const res = await fetchStudents()
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const dbStudents = res.data
          const dbIds = new Set(dbStudents.map((s: any) => String(s.id || s.admission_no || s.admissionNo)))
          const uniqueLocal = localStudents.filter((s: any) => !dbIds.has(String(s.id || s.admission_no || s.admissionNo)))
          setAllStudents([...dbStudents, ...uniqueLocal])
        } else if (localStudents.length > 0) {
          setAllStudents(localStudents)
        }
      } catch {
        if (localStudents.length > 0) setAllStudents(localStudents)
      } finally {
        setStudentsLoading(false)
      }
    }
    load()
  }, [])

  // Build unique class names from Master (and fallback to students)
  const classOptions = useMemo(() => {
    const set = new Set<string>()

    // 1. From masters hook
    if (Array.isArray(classesData)) {
      classesData.forEach((c: any) => {
        if (!c.deleted) {
          const name = c.className || c.name
          if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
        }
      })
    }

    // 2. Direct localStorage for immediate sync
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

    // 3. Fallback from students
    allStudents.forEach(s => {
      const name = s.class_name || s.className || s.class
      if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
    })

    return Array.from(set)
  }, [classesData, allStudents])

  // Build section options for selected class from Master & students
  const sectionOptions = useMemo(() => {
    if (!selectedClass) return []
    const set = new Set<string>()
    const targetNorm = selectedClass.trim().toLowerCase()

    // 1. From sectionsData master
    if (Array.isArray(sectionsData)) {
      sectionsData.forEach((s: any) => {
        if (!s.deleted) {
          const sClass = (s.className || s.class || '').trim().toLowerCase()
          if (!sClass || sClass === targetNorm) {
            const name = s.sectionName || s.name
            if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
          }
        }
      })
    }

    // 2. Direct localStorage school_masters_sections
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('school_masters_sections')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            parsed.forEach((s: any) => {
              if (!s.deleted) {
                const sClass = (s.className || s.class || '').trim().toLowerCase()
                if (!sClass || sClass === targetNorm) {
                  const name = s.sectionName || s.name
                  if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
                }
              }
            })
          }
        }
      } catch (e) {}
    }

    // 3. Check classes master for c.sections array
    const checkClassObjSections = (list: any[]) => {
      if (!Array.isArray(list)) return
      const classObj = list.find((c: any) => (c.className || c.name || '').trim().toLowerCase() === targetNorm)
      if (classObj && Array.isArray(classObj.sections)) {
        classObj.sections.forEach((sec: any) => {
          const name = typeof sec === 'string' ? sec : (sec?.sectionName || sec?.name)
          if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
        })
      }
    }
    checkClassObjSections(classesData)
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('school_masters_classes')
        if (raw) checkClassObjSections(JSON.parse(raw))
      } catch (e) {}
    }

    // 4. Check students for this class
    allStudents.forEach(s => {
      const sc = String(s.class_name || s.className || s.class || '').trim().toLowerCase()
      if (sc === targetNorm) {
        const name = s.section_name || s.sectionName || s.section
        if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
      }
    })

    // 5. Default fallback if class is selected but has no section defined yet
    if (set.size === 0) {
      return ['A', 'B', 'C']
    }

    return Array.from(set)
  }, [selectedClass, sectionsData, classesData, allStudents])

  // Students for selected class + section
  const filteredStudents = useMemo(() => {
    return allStudents.filter(s => {
      const sc = String(s.class_name || s.className || s.class || '').trim().toLowerCase()
      const ss = String(s.section_name || s.sectionName || s.section || '').trim().toLowerCase()
      const cMatch = !selectedClass || sc === selectedClass.trim().toLowerCase()
      
      const normSection = selectedSection.toLowerCase().replace(/^(section|sec)\s*/i, '').trim()
      const normStudentSection = ss.replace(/^(section|sec)\s*/i, '').trim()
      const sMatch = !selectedSection || ss === selectedSection.toLowerCase() || (normSection && normStudentSection === normSection)
      return cMatch && sMatch
    })
  }, [allStudents, selectedClass, selectedSection])

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // Handle OTP send
  const handleSendOTP = () => {
    if (!parentsMobile || parentsMobile.length < 10) {
      showToast("Please enter a valid 10-digit mobile number.", 'error')
      return
    }
    setOtpSent(true)
    showToast(`OTP sent to ${parentsMobile}`, 'success')
  }

  // Handle OTP verify (mock — in prod, verify server-side)
  const handleVerifyOTP = () => {
    if (!otpCode) {
      showToast('Please enter the OTP.', 'error')
      return
    }
    setOtpVerified(true)
    showToast('OTP verified successfully!', 'success')
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ open: true, msg, type })
    setTimeout(() => setToast(prev => ({ ...prev, open: false })), 3000)
  }

  // Save gate pass
  const handleSave = async () => {
    if (tab === 'student') {
      if (!selectedClass || !selectedSection || !selectedStudent) {
        showToast('Please select Class, Section and Student.', 'error'); return
      }
      if (!receiverName) {
        showToast('Receiver Name is required.', 'error'); return
      }
    } else {
      if (!visitorName) {
        showToast('Visitor Name is required.', 'error'); return
      }
    }

    setSaving(true)
    try {
      const payload = tab === 'student'
        ? {
            passType: 'one-time' as const,
            userType: 'Student' as const,
            studentName: `${selectedStudent?.first_name || ''} ${selectedStudent?.last_name || ''}`.trim() || selectedStudent?.name || '',
            className: selectedClass,
            sectionName: selectedSection,
            rollNo: String(selectedStudent?.roll_no || selectedStudent?.rollNo || ''),
            parentsMobile,
            receiverName,
            receiverMobile,
            receiverRelation,
            vehicleNo,
            entryGate,
            exitGate,
            reason,
            remarks,
            visitDate,
            visitTime,
            photoUrl
          }
        : {
            passType: 'one-time' as const,
            userType: 'Visitor' as const,
            visitorName,
            visitorMobile,
            vehicleNo,
            entryGate,
            exitGate,
            reason,
            remarks,
            visitDate,
            visitTime
          }

      const res = await createOneTimeGatePass(payload)
      if (res?.success) {
        showToast('Gate pass created successfully!', 'success')
        setTimeout(() => router.push('/institute/gate-pass'), 1200)
      } else {
        showToast(res?.error || 'Failed to save gate pass.', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Unexpected error.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-200">

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/institute/gate-pass"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight">Create One Time Gate Pass</h1>
            <p className="text-xs text-teal-100 mt-0.5">Issue a single-use entry pass for student pickup or visitor access</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/institute/gate-pass')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Gate Pass'}
          </button>
        </div>
      </div>

      {/* ── PASS TYPE TABS (Student's Relative / Visitor) ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-sm flex gap-2">
        <button
          type="button"
          onClick={() => setTab('student')}
          className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            tab === 'student'
              ? 'bg-[#0d8065] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Student's Relative
        </button>
        <button
          type="button"
          onClick={() => setTab('visitor')}
          className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            tab === 'visitor'
              ? 'bg-[#0d8065] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          Visitor
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          STUDENT'S RELATIVE FORM
      ══════════════════════════════════════════════════════════════════════════ */}
      {tab === 'student' && (
        <div className="space-y-5">

          {/* ── 1. Student Details ── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">1</span>
              Student Details
            </h2>

            {/* Class / Section / Student row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Class <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={e => { setSelectedClass(e.target.value); setSelectedSection(''); setSelectedStudent(null) }}
                    className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-800 cursor-pointer"
                  >
                    <option value="">Select an Option</option>
                    {classOptions.map(cn => (
                      <option key={String(cn)} value={String(cn)}>{String(cn)}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Section */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Section <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedSection}
                    onChange={e => { setSelectedSection(e.target.value); setSelectedStudent(null) }}
                    className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-800 cursor-pointer"
                    disabled={!selectedClass}
                  >
                    <option value="">Select an Option</option>
                    {sectionOptions.map(sn => (
                      <option key={String(sn)} value={String(sn)}>{String(sn)}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Student Name with Roll No */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Student Name with Roll No. <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedStudent?.id || ''}
                    onChange={e => {
                      const s = filteredStudents.find(st => String(st.id) === e.target.value)
                      setSelectedStudent(s || null)
                      if (s) {
                        const pMobile = s.parent_mobile || s.parentMobile || s.father_mobile || s.fatherMobile || s.mobile || s.phone || ''
                        if (pMobile) {
                          setParentsMobile(String(pMobile).replace(/\D/g, '').slice(0, 10))
                        }
                      }
                    }}
                    className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-800 cursor-pointer"
                    disabled={!selectedClass || !selectedSection}
                  >
                    <option value="">Select an Option</option>
                    {filteredStudents.map(s => {
                      const name = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || 'Unknown'
                      const roll = s.roll_no || s.rollNo || '—'
                      return (
                        <option key={s.id} value={String(s.id)}>
                          {name} — Roll: {roll}
                        </option>
                      )
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Selected Student Info Card */}
            {selectedStudent && (
              <div className="flex items-center gap-3.5 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-[#0d8065] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {(selectedStudent.first_name || selectedStudent.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm text-slate-900 truncate">
                    {`${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim() || selectedStudent.name}
                  </p>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    {selectedClass} – Sec {selectedSection} &nbsp;|&nbsp; Roll No: {selectedStudent.roll_no || selectedStudent.rollNo || '—'} &nbsp;|&nbsp; {selectedStudent.admission_no || selectedStudent.admissionNo || ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="ml-auto text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ── 2. Receiver Details ── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">2</span>
              Receiver Details
            </h2>

            {/* Parents Mobile + Send OTP */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Parents Mobile No. <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={parentsMobile}
                    maxLength={10}
                    onChange={e => setParentsMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={otpSent ? handleVerifyOTP : handleSendOTP}
                  disabled={otpVerified}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all whitespace-nowrap ${
                    otpVerified
                      ? 'bg-emerald-500 text-white cursor-default'
                      : 'bg-[#0d8065] hover:bg-[#0a6c55] text-white'
                  }`}
                >
                  {otpVerified ? '✓ Verified' : otpSent ? 'Verify OTP' : 'Send OTP'}
                </button>
              </div>

              {/* OTP Input Field (shown after Send OTP) */}
              {otpSent && !otpVerified && (
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otpCode}
                    maxLength={6}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-4 py-2.5 border border-teal-400 rounded-xl text-xs font-bold outline-none focus:border-teal-600 tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold"
                  >
                    Confirm OTP
                  </button>
                </div>
              )}
            </div>

            {/* Receiver Name / Mobile / Relation / Vehicle */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Receiver Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter Receiver Name"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Receiver Mobile No. <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="Enter Mobile No."
                  value={receiverMobile}
                  onChange={e => setReceiverMobile(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Student's Relative <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={receiverRelation}
                    onChange={e => setReceiverRelation(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white cursor-pointer"
                  >
                    <option value="">Select Relation</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Vehicle No. (If any)</label>
                <input
                  type="text"
                  placeholder="Enter Vehicle No."
                  value={vehicleNo}
                  onChange={e => setVehicleNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Photo Capture */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Capture Receiver Photo</label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`relative w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  photoUrl ? 'border-teal-400 bg-teal-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {photoUrl ? (
                  <>
                    <img src={photoUrl} alt="Receiver" className="w-full h-full object-cover rounded-2xl" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPhotoUrl('') }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-teal-600" />
                    </div>
                    <p className="text-xs font-bold text-teal-600">Capture Receiver Photo</p>
                    <p className="text-[10px] text-slate-400">(Tap to upload Photo)</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
          </div>

          {/* ── 3. Visit Details ── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">3</span>
              Visit Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={visitDate}
                    onChange={e => setVisitDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Time <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="time"
                    value={visitTime}
                    onChange={e => setVisitTime(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Entry Gate</label>
                <input
                  type="text"
                  placeholder="Enter Gate No."
                  value={entryGate}
                  onChange={e => setEntryGate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Exit Gate</label>
                <input
                  type="text"
                  placeholder="Enter Gate No."
                  value={exitGate}
                  onChange={e => setExitGate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* ── 4. Additional Information ── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">4</span>
              Additional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Reason</label>
                <input
                  type="text"
                  placeholder="Enter Reason"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Remarks</label>
                <input
                  type="text"
                  placeholder="Enter Remarks"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VISITOR FORM
      ══════════════════════════════════════════════════════════════════════════ */}
      {tab === 'visitor' && (
        <div className="space-y-5">

          {/* Visitor Details */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">1</span>
              Visitor Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Visitor Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter Visitor Name"
                  value={visitorName}
                  onChange={e => setVisitorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Mobile No.</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Enter Mobile No."
                    value={visitorMobile}
                    maxLength={10}
                    onChange={e => setVisitorMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Vehicle No. (If any)</label>
                <input
                  type="text"
                  placeholder="Enter Vehicle No."
                  value={vehicleNo}
                  onChange={e => setVehicleNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">2</span>
              Visit Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={visitDate}
                    onChange={e => setVisitDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Time <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="time"
                    value={visitTime}
                    onChange={e => setVisitTime(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Entry Gate</label>
                <input
                  type="text"
                  placeholder="Enter Gate No."
                  value={entryGate}
                  onChange={e => setEntryGate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Exit Gate</label>
                <input
                  type="text"
                  placeholder="Enter Gate No."
                  value={exitGate}
                  onChange={e => setExitGate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">3</span>
              Additional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Reason</label>
                <input
                  type="text"
                  placeholder="Enter Reason"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Remarks</label>
                <input
                  type="text"
                  placeholder="Enter Remarks"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ACTIONS ── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Link
          href="/institute/gate-pass"
          className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          Cancel
        </Link>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-2.5 bg-[#0d8065] hover:bg-[#0a6c55] disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Gate Pass'}
        </button>
      </div>

      {/* ── TOAST ── */}
      {toast.open && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            : <X className="w-5 h-5 text-red-200" />
          }
          <span className="text-xs font-bold">{toast.msg}</span>
        </div>
      )}

    </div>
  )
}

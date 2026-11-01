'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  ArrowLeft, Camera, X, CheckCircle2,
  ChevronDown, Users, User, Loader2, Phone,
  Clock, Calendar, Shield, Sparkles, Lock, Check
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchStudents } from '@/app/institute/students/actions'
import { createOneTimeGatePass } from '@/app/institute/gate-pass/actions'
import { useClasses, useSections } from '@/lib/mastersData'

type GatePassTab = 'student' | 'visitor'

interface ParentOption {
  id: string
  name: string
  mobile: string
  relation: string
}

function cleanPhone(val?: any): string {
  if (!val) return ''
  const digits = String(val).replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  return digits.slice(-10)
}

function getStudentParents(student: any, registeredParents: any[] = []): ParentOption[] {
  if (!student) return []
  const list: ParentOption[] = []
  const seen = new Set<string>()

  const add = (id: string, name?: string, phone?: string, relation: string = 'Parent') => {
    const trimmedName = (name || '').trim()
    const cleanedMobile = cleanPhone(phone)
    if (!trimmedName && !cleanedMobile) return
    const key = `${trimmedName.toLowerCase()}_${cleanedMobile}`
    if (seen.has(key)) return
    seen.add(key)
    list.push({
      id,
      name: trimmedName || relation,
      mobile: cleanedMobile,
      relation
    })
  }

  // 1. Father
  const fName = student.fatherName || student.father_name || student.father
  const fPhone = student.fatherContact || student.father_contact || student.fatherMobile || student.father_mobile || student.fatherPhone || student.father_phone
  if (fName || fPhone) {
    add('father', fName || 'Father', fPhone, 'Father')
  }

  // 2. Mother
  const mName = student.motherName || student.mother_name || student.mother
  const mPhone = student.motherContact || student.mother_contact || student.motherMobile || student.mother_mobile || student.motherPhone || student.mother_phone
  if (mName || mPhone) {
    add('mother', mName || 'Mother', mPhone, 'Mother')
  }

  // 3. Guardian
  const gName = student.guardianName || student.guardian_name || student.guardian
  const gPhone = student.guardianContact || student.guardian_contact || student.guardianMobile || student.guardian_mobile || student.guardianPhone || student.guardian_phone
  if (gName || gPhone) {
    add('guardian', gName || 'Guardian', gPhone, 'Guardian')
  }

  // 4. Embedded student.parents
  if (Array.isArray(student.parents)) {
    student.parents.forEach((p: any, idx: number) => {
      const pName = p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.parentName
      const pPhone = p.contact || p.mobile || p.phone || p.mobileNo
      const pRel = p.parentType || p.relation || 'Parent'
      add(`embedded_${idx}`, pName, pPhone, pRel)
    })
  }

  // 5. Registered parents in localStorage
  if (Array.isArray(registeredParents) && registeredParents.length > 0) {
    const sAdm = String(student.admission_no || student.admissionNo || '').trim().toLowerCase()
    const sId = String(student.id || '').trim().toLowerCase()

    registeredParents.forEach((p: any) => {
      if (p.deleted) return
      const pName = p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim()
      const pPhone = p.contact || p.mobileNo || p.mobile
      const pRel = p.parentType || (p.gender === 'Female' ? 'Mother' : 'Father')

      const isLinked = (p.studentId && String(p.studentId).toLowerCase() === sId) ||
                       (p.admissionNo && String(p.admissionNo).toLowerCase() === sAdm) ||
                       (Array.isArray(p.students) && p.students.some((x: any) => String(x).toLowerCase() === sId || String(x).toLowerCase() === sAdm))
      
      const isContactMatch = pPhone && (cleanPhone(pPhone) === cleanPhone(fPhone) || cleanPhone(pPhone) === cleanPhone(mPhone))
      const isNameMatch = pName && ((fName && pName.toLowerCase() === fName.toLowerCase()) || (mName && pName.toLowerCase() === mName.toLowerCase()))

      if (isLinked || isContactMatch || isNameMatch) {
        add(`reg_${p.id || pName}`, pName, pPhone, pRel)
      }
    })
  }

  // 6. Generic student parent fallback
  const genName = student.parent_name || student.parentName
  const genPhone = student.parent_mobile || student.parentMobile || student.emergency_contact || student.emergencyContact || student.contact || student.mobileNo || student.mobile || student.phone
  if (list.length === 0 && (genName || genPhone)) {
    add('general_parent', genName || 'Parent / Guardian', genPhone, 'Parent')
  }

  return list
}

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
  const [allRegisteredParents, setAllRegisteredParents] = useState<any[]>([])
  const [parentName, setParentName] = useState('')
  const [parentRelation, setParentRelation] = useState('')
  const [selectedParentId, setSelectedParentId] = useState('')
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

  // Load registered parents from localStorage
  useEffect(() => {
    try {
      const p1 = localStorage.getItem('school_institute_parents')
      const p2 = localStorage.getItem('school_parents')
      const list: any[] = []
      if (p1) {
        const parsed1 = JSON.parse(p1)
        if (Array.isArray(parsed1)) list.push(...parsed1)
      }
      if (p2) {
        const parsed2 = JSON.parse(p2)
        if (Array.isArray(parsed2)) list.push(...parsed2)
      }
      setAllRegisteredParents(list)
    } catch (e) {}
  }, [])

  // Available parents for selected student
  const availableParents = useMemo(() => {
    return getStudentParents(selectedStudent, allRegisteredParents)
  }, [selectedStudent, allRegisteredParents])

  // Auto-populate parent details and pre-fill receiver when student or availableParents change
  useEffect(() => {
    if (!selectedStudent) {
      setParentName('')
      setParentsMobile('')
      setParentRelation('')
      setSelectedParentId('')
      setOtpSent(false)
      setOtpVerified(false)
      setOtpCode('')
      return
    }

    if (availableParents.length > 0) {
      const current = availableParents.find(p => p.id === selectedParentId)
      const toSelect = current || availableParents[0]
      setSelectedParentId(toSelect.id)
      setParentName(toSelect.name)
      setParentsMobile(toSelect.mobile)
      setParentRelation(toSelect.relation)
      setOtpSent(false)
      setOtpVerified(false)
      setOtpCode('')

      // Auto-fill receiver data when parent is selected
      if (!receiverName || (parentName && receiverName === parentName)) {
        setReceiverName(toSelect.name)
        setReceiverMobile(toSelect.mobile)
        setReceiverRelation(toSelect.relation)
      }
    } else {
      setSelectedParentId('')
      setParentName('')
      setParentRelation('')
      const fallbackMobile = cleanPhone(selectedStudent.contact || selectedStudent.mobileNo || selectedStudent.phone || selectedStudent.parent_mobile || selectedStudent.father_mobile)
      setParentsMobile(fallbackMobile)
      setOtpSent(false)
      setOtpVerified(false)
      setOtpCode('')
    }
  }, [selectedStudent, availableParents])

  // Select parent handler (with auto-fill receiver data)
  const handleSelectParent = (p: ParentOption) => {
    setSelectedParentId(p.id)
    setParentName(p.name)
    setParentsMobile(p.mobile)
    setParentRelation(p.relation)
    setOtpSent(false)
    setOtpVerified(false)
    setOtpCode('')

    // Auto-fill receiver data after selecting parent
    if (!receiverName || (parentName && receiverName === parentName)) {
      setReceiverName(p.name)
      setReceiverMobile(p.mobile)
      setReceiverRelation(p.relation)
    }
  }

  // Quick sync: receiver is the selected parent
  const handleSyncReceiverFromParent = () => {
    if (!parentName && !parentsMobile) {
      showToast('Select or enter parent details first.', 'error')
      return
    }
    setReceiverName(parentName)
    setReceiverMobile(parentsMobile)
    setReceiverRelation(parentRelation || 'Father')
    showToast(`Receiver details synced from ${parentName || 'Parent'}!`, 'success')
  }

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
            parentName,
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
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('school_gate_passes')
            const existing = raw ? JSON.parse(raw) : []
            localStorage.setItem('school_gate_passes', JSON.stringify([payload, ...existing]))
          } catch (e) {}
        }
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
      <div className="bg-gradient-to-r from-[#1b3a60] to-teal-700 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-teal-800 hover:bg-teal-50 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-60"
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
              ? 'bg-teal-600 text-white shadow-sm'
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
              ? 'bg-teal-600 text-white shadow-sm'
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
              <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-black">1</span>
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
              <div className="flex items-center gap-3.5 p-4 bg-gradient-to-r from-blue-50/80 to-teal-50/60 dark:from-blue-950/30 dark:to-teal-950/20 border border-blue-200 dark:border-blue-900/60 rounded-2xl shadow-2xs">
                <div className="w-11 h-11 rounded-2xl bg-[#1b3a60] text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs">
                  {(selectedStudent.first_name || selectedStudent.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-sm text-slate-900 dark:text-slate-100">
                      {`${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim() || selectedStudent.name}
                    </p>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 px-2 py-0.5 rounded-full">
                      {selectedClass} · Sec {selectedSection}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Roll: <strong className="text-slate-700 dark:text-slate-300">{selectedStudent.roll_no || selectedStudent.rollNo || '—'}</strong> &nbsp;|&nbsp; 
                    Adm No: <strong className="text-slate-700 dark:text-slate-300">{selectedStudent.admission_no || selectedStudent.admissionNo || '—'}</strong>
                  </p>
                  {availableParents.length > 0 && (
                    <div className="text-[11px] text-teal-700 dark:text-teal-400 font-bold mt-1 flex items-center gap-1.5 flex-wrap">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {availableParents.length === 1 ? 'Parent on record: ' : `Detected Parents (${availableParents.length}): `}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {availableParents.map(p => (
                          <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-100/70 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 text-[10px]">
                            <strong>{p.name}</strong> ({p.relation})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors shadow-2xs flex-shrink-0"
                  title="Change Student"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ── 2. Receiver & Parent Verification Details ── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 flex items-center justify-center text-xs font-black">2</span>
                Receiver &amp; Parent Verification Details
              </h2>
              {selectedStudent && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  OTP will be sent to verified Parent mobile
                </span>
              )}
            </div>

            {/* Multiple Parents Picker (shown when student has more than 1 parent) */}
            {availableParents.length > 1 && (
              <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/40 dark:to-blue-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                      More than 1 Parent Found ({availableParents.length}) — Select one to auto-fill details:
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 px-2 py-0.5 rounded-full">
                    {availableParents.find(p => p.id === selectedParentId)?.relation || 'Parent'} Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {availableParents.map((p) => {
                    const isSelected = selectedParentId === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectParent(p)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 relative ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-400/50'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-300 hover:bg-teal-50/40'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                        }`}>
                          {p.relation === 'Mother' ? '👩' : p.relation === 'Father' ? '👨' : '👤'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs truncate">{p.name}</span>
                            <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                              isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {p.relation}
                            </span>
                          </div>
                          <p className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                            {p.mobile || 'No Mobile'}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-white text-teal-700 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Parent Details Row (Parent Name column + Parents Mobile No. with Send OTP) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parent Name Column (Non-editable, Locked) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Parent Name <span className="text-red-500">*</span></span>
                    <span className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      <Lock className="w-2.5 h-2.5" /> Auto-filled (Locked)
                    </span>
                  </label>
                  {parentRelation && (
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-900/60">
                      {parentRelation}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Select student above to load parent name"
                    value={parentName}
                    readOnly
                    tabIndex={-1}
                    className="w-full pl-3.5 pr-9 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs cursor-not-allowed select-none"
                    required
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Parents Mobile No. (For OTP) Column (Non-editable, Locked) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>Parents Mobile No. (For OTP) <span className="text-red-500">*</span></span>
                    <span className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      <Lock className="w-2.5 h-2.5" /> Auto-filled (Locked)
                    </span>
                  </label>
                  {otpVerified && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> OTP Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      placeholder="Select student above to load mobile"
                      value={parentsMobile}
                      maxLength={10}
                      readOnly
                      tabIndex={-1}
                      className="w-full pl-3.5 pr-9 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs font-mono cursor-not-allowed select-none"
                      required
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <button
                    type="button"
                    onClick={otpSent ? handleVerifyOTP : handleSendOTP}
                    disabled={otpVerified || !parentsMobile}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs whitespace-nowrap transition-all ${
                      otpVerified
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50'
                    }`}
                  >
                    {otpVerified ? '✓ Verified' : otpSent ? 'Verify OTP' : 'Send OTP'}
                  </button>
                </div>

                {/* OTP Input Field (shown after Send OTP) */}
                {otpSent && !otpVerified && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      maxLength={6}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3.5 py-2 border border-teal-400 rounded-xl text-xs font-bold outline-none focus:border-teal-600 tracking-widest bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
                    >
                      Confirm OTP
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Separator / Authorized Receiver Details header with Same as Parent button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Authorized Receiver Details
              </span>
              {(parentName || parentsMobile) && (
                <button
                  type="button"
                  onClick={handleSyncReceiverFromParent}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Copy selected parent details to receiver fields"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Same as Parent (Copy {parentName || 'Parent'})</span>
                </button>
              )}
            </div>

            {/* Receiver Name / Mobile / Relation / Vehicle */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Receiver Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Receiver Name"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Receiver Mobile No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter Mobile No."
                  value={receiverMobile}
                  onChange={e => setReceiverMobile(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Student's Relative <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 flex-wrap">
                    {['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Grandparent', 'Guardian', 'Driver'].map(rel => (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => setReceiverRelation(rel)}
                        className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold transition-colors ${
                          receiverRelation.toLowerCase() === rel.toLowerCase()
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Father, Mother, Uncle, Driver"
                  value={receiverRelation}
                  onChange={e => setReceiverRelation(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Vehicle No. (If any)</label>
                <input
                  type="text"
                  placeholder="Enter Vehicle No."
                  value={vehicleNo}
                  onChange={e => setVehicleNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs uppercase"
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
          className="inline-flex items-center gap-2 px-8 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition-all shadow-teal-600/20"
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

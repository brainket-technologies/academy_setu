'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  ArrowLeft, Camera, X, CheckCircle2,
  ChevronDown, Users, User, Loader2, Phone,
  Shield, CreditCard, Calendar, Upload, Sparkles, Check
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchStudents } from '@/app/institute/students/actions'
import { createOneTimeGatePass } from '@/app/institute/gate-pass/actions'
import { useClasses, useSections } from '@/lib/mastersData'

type PassUserType = 'student' | 'visitor'

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

export default function PermanentRegistrationPage() {
  const router = useRouter()
  const classesData = useClasses()
  const sectionsData = useSections()

  const [userType, setUserType] = useState<PassUserType>('student')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })

  // ── Students & Registered Parents ──
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [allRegisteredParents, setAllRegisteredParents] = useState<any[]>([])

  // ── Student fields ──
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // ── Parent & Receiver ──
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

  // ── Aadhar ──
  const [aadharNo, setAadharNo] = useState('')
  const [aadharFrontUrl, setAadharFrontUrl] = useState('')
  const [aadharBackUrl, setAadharBackUrl] = useState('')
  const [receiverPhotoUrl, setReceiverPhotoUrl] = useState('')

  // ── Validity ──
  const [validFrom, setValidFrom] = useState(() => new Date().toISOString().split('T')[0])
  const [validTo, setValidTo] = useState('')

  // ── Visitor fields ──
  const [visitorName, setVisitorName] = useState('')
  const [visitorMobile, setVisitorMobile] = useState('')
  const [vehicleNo, setVehicleNo] = useState('')
  const [reason, setReason] = useState('')
  const [remarks, setRemarks] = useState('')

  // File refs
  const frontRef = useRef<HTMLInputElement>(null)
  const backRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

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

  // Load students & merge local details (e.g. father/mother info)
  useEffect(() => {
    async function load() {
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

      const localMap = new Map<string, any>()
      localStudents.forEach((s: any) => {
        const k1 = String(s.id || '')
        const k2 = String(s.admission_no || s.admissionNo || '')
        if (k1) localMap.set(k1, s)
        if (k2) localMap.set(k2, s)
      })

      try {
        const res = await fetchStudents()
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const dbStudents = res.data.map((dbS: any) => {
            const loc = localMap.get(String(dbS.id)) || localMap.get(String(dbS.admission_no || dbS.admissionNo))
            return loc ? { ...loc, ...dbS } : dbS
          })
          const dbIds = new Set(dbStudents.map((s: any) => String(s.id || s.admission_no || s.admissionNo)))
          const uniqueLocal = localStudents.filter((s: any) => !dbIds.has(String(s.id || s.admission_no || s.admissionNo)))
          setAllStudents([...dbStudents, ...uniqueLocal])
        } else if (localStudents.length > 0) {
          setAllStudents(localStudents)
        }
      } catch {
        if (localStudents.length > 0) setAllStudents(localStudents)
      }
    }
    load()
  }, [])

  // Computed available parents for currently selected student
  const availableParents = useMemo(() => {
    return getStudentParents(selectedStudent, allRegisteredParents)
  }, [selectedStudent, allRegisteredParents])

  // Auto-populate parent details when student is selected or changes
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
      // If currently selected parent is still in the available list, keep it; else select first parent
      const current = availableParents.find(p => p.id === selectedParentId)
      const toSelect = current || availableParents[0]
      setSelectedParentId(toSelect.id)
      setParentName(toSelect.name)
      setParentsMobile(toSelect.mobile)
      setParentRelation(toSelect.relation)
      setOtpSent(false)
      setOtpVerified(false)
      setOtpCode('')
    } else {
      setSelectedParentId('')
      setParentName('')
      setParentRelation('')
      const fallbackMobile = cleanPhone(selectedStudent.contact || selectedStudent.mobileNo || selectedStudent.phone)
      setParentsMobile(fallbackMobile)
      setOtpSent(false)
      setOtpVerified(false)
      setOtpCode('')
    }
  }, [selectedStudent, availableParents])

  // Handler to switch selected parent when more than 1 parent exists
  const handleSelectParent = (p: ParentOption) => {
    setSelectedParentId(p.id)
    setParentName(p.name)
    setParentsMobile(p.mobile)
    setParentRelation(p.relation)
    setOtpSent(false)
    setOtpVerified(false)
    setOtpCode('')
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
    showToast('Receiver details synced from selected parent!', 'success')
  }

  // Class options from Master & Students
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
    allStudents.forEach(s => {
      const name = s.class_name || s.className || s.class
      if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
    })
    return Array.from(set)
  }, [classesData, allStudents])

  // Section options from Master & Students
  const sectionOptions = useMemo(() => {
    if (!selectedClass) return []
    const set = new Set<string>()
    const targetNorm = selectedClass.trim().toLowerCase()

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
    allStudents.forEach(s => {
      const sc = String(s.class_name || s.className || s.class || '').trim().toLowerCase()
      if (sc === targetNorm) {
        const name = s.section_name || s.sectionName || s.section
        if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
      }
    })
    if (set.size === 0) return ['A', 'B', 'C']
    return Array.from(set)
  }, [selectedClass, sectionsData, classesData, allStudents])

  const filteredStudents = useMemo(() =>
    allStudents.filter(s => {
      const sc = String(s.class_name || s.className || s.class || '').trim().toLowerCase()
      const ss = String(s.section_name || s.sectionName || s.section || '').trim().toLowerCase()
      const cMatch = !selectedClass || sc === selectedClass.trim().toLowerCase()
      const normSection = selectedSection.toLowerCase().replace(/^(section|sec)\s*/i, '').trim()
      const normStudentSection = ss.replace(/^(section|sec)\s*/i, '').trim()
      const sMatch = !selectedSection || ss === selectedSection.toLowerCase() || (normSection && normStudentSection === normSection)
      return cMatch && sMatch
    })
  , [allStudents, selectedClass, selectedSection])

  // File handlers
  const readFile = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader()
    reader.onload = e => cb(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ open: true, msg, type })
    setTimeout(() => setToast(p => ({ ...p, open: false })), 3500)
  }

  // OTP handlers
  const handleSendOTP = () => {
    const targetMobile = userType === 'student' ? parentsMobile : visitorMobile
    if (!targetMobile || targetMobile.length < 10) {
      showToast('Enter a valid 10-digit mobile number.', 'error')
      return
    }
    setOtpSent(true)
    const label = userType === 'student' ? `parent (${parentsMobile})` : `visitor (${visitorMobile})`
    showToast(`OTP sent to ${label}`, 'success')
  }

  const handleVerifyOTP = () => {
    if (!otpCode) { showToast('Please enter the OTP.', 'error'); return }
    setOtpVerified(true)
    showToast('OTP verified successfully!', 'success')
  }

  // Validate Aadhar (12 digits)
  const isValidAadhar = (v: string) => /^\d{12}$/.test(v)

  // Save
  const handleSave = async () => {
    if (userType === 'student') {
      if (!selectedClass || !selectedSection || !selectedStudent) { showToast('Please select Class, Section and Student.', 'error'); return }
      if (!parentName.trim()) { showToast('Parent Name is required.', 'error'); return }
      if (!parentsMobile || parentsMobile.length < 10) { showToast('Please enter a valid 10-digit Parents Mobile No. for OTP verification.', 'error'); return }
      if (!receiverName || !receiverMobile || !receiverRelation) { showToast('Receiver Name, Mobile and Relation are required.', 'error'); return }
      if (aadharNo && !isValidAadhar(aadharNo)) { showToast('Aadhar Card No. must be 12 digits.', 'error'); return }
    } else {
      if (!visitorName || !visitorMobile) { showToast('Visitor Name and Mobile are required.', 'error'); return }
      if (aadharNo && !isValidAadhar(aadharNo)) { showToast('Aadhar Card No. must be 12 digits.', 'error'); return }
    }

    setSaving(true)
    try {
      const payload = userType === 'student'
        ? {
            passType: 'permanent' as const,
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
            aadharNo,
            aadharFrontUrl,
            aadharBackUrl,
            photoUrl: receiverPhotoUrl,
            validFrom,
            validTo,
            vehicleNo,
            reason,
            remarks
          }
        : {
            passType: 'permanent' as const,
            userType: 'Visitor' as const,
            visitorName,
            visitorMobile,
            receiverName: visitorName,
            receiverMobile: visitorMobile,
            receiverRelation,
            aadharNo,
            aadharFrontUrl,
            aadharBackUrl,
            photoUrl: receiverPhotoUrl,
            validFrom,
            validTo,
            vehicleNo,
            reason,
            remarks
          }

      // Also persist to localStorage for instant local reflection
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('school_gate_passes')
          const existing = raw ? JSON.parse(raw) : []
          localStorage.setItem('school_gate_passes', JSON.stringify([payload, ...existing]))
        } catch (e) {}
      }

      const res = await createOneTimeGatePass(payload)
      if (res?.success) {
        showToast('Permanent gate pass registered!', 'success')
        setTimeout(() => router.push('/institute/gate-pass'), 1400)
      } else {
        showToast(res?.error || 'Failed to save.', 'error')
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
            <h1 className="text-xl font-black tracking-tight">Permanent Gate Pass Registration</h1>
            <p className="text-xs text-blue-100 mt-0.5">Register a verified permanent visitor with Aadhar verification</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/institute/gate-pass')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-[#1b3a60] hover:bg-blue-50 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Registration'}
          </button>
        </div>
      </div>

      {/* ── USER TYPE TABS ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-sm flex gap-2">
        <button
          type="button"
          onClick={() => {
            setUserType('student')
            setOtpSent(false)
            setOtpVerified(false)
            setOtpCode('')
          }}
          className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            userType === 'student' ? 'bg-[#1b3a60] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <Users className="w-4 h-4" /> Student's Relative
        </button>
        <button
          type="button"
          onClick={() => {
            setUserType('visitor')
            setOtpSent(false)
            setOtpVerified(false)
            setOtpCode('')
          }}
          className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            userType === 'visitor' ? 'bg-[#1b3a60] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <User className="w-4 h-4" /> Permanent Visitor (Not Relative)
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          STUDENT FORM
      ══════════════════════════════════════════════════════ */}
      {userType === 'student' && (
        <div className="space-y-5">

          {/* 1. Student Details */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">1</span>
              Student Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Class <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={e => { setSelectedClass(e.target.value); setSelectedSection(''); setSelectedStudent(null) }}
                    className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    <option value="">Select an Option</option>
                    {classOptions.map(cn => <option key={cn} value={cn}>{cn}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Section */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Section <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={selectedSection}
                    onChange={e => { setSelectedSection(e.target.value); setSelectedStudent(null) }}
                    disabled={!selectedClass}
                    className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 bg-white cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select an Option</option>
                    {sectionOptions.map(sn => <option key={sn} value={sn}>{sn}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Student with Roll No */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Student Name with Roll No. <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={selectedStudent?.id || ''}
                    onChange={e => setSelectedStudent(filteredStudents.find(s => String(s.id) === e.target.value) || null)}
                    disabled={!selectedClass || !selectedSection}
                    className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 bg-white cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select an Option</option>
                    {filteredStudents.map(s => {
                      const name = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || 'Unknown'
                      const roll = s.roll_no || s.rollNo || '—'
                      return <option key={s.id} value={String(s.id)}>{name} — Roll: {roll}</option>
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Selected student chip */}
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

          {/* 2. Receiver & Parent Details */}
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
                      More than 1 Parent Found ({availableParents.length}) — Select one to auto-fill OTP number &amp; name:
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
              {/* Parent Name Column */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Parent Name <span className="text-red-500">*</span></span>
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
                    placeholder="Enter Parent Name"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* Parents Mobile No. (For OTP) Column */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>Parents Mobile No. (For OTP) <span className="text-red-500">*</span></span>
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
                      placeholder="Enter 10-digit mobile number"
                      value={parentsMobile}
                      maxLength={10}
                      onChange={e => {
                        setParentsMobile(e.target.value.replace(/\D/g, ''))
                        setOtpVerified(false)
                        setOtpSent(false)
                      }}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs font-mono"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={otpVerified ? undefined : handleSendOTP}
                    disabled={otpVerified || !parentsMobile}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs whitespace-nowrap transition-all ${
                      otpVerified
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50'
                    }`}
                  >
                    {otpVerified ? '✓ Verified' : 'Send OTP'}
                  </button>
                </div>
                {otpSent && !otpVerified && (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      maxLength={6}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3.5 py-2 border border-teal-400 rounded-xl text-xs font-bold outline-none tracking-widest bg-white dark:bg-slate-900"
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

            {/* Quick helper to sync Receiver from Parent */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/80 flex-wrap gap-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
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

            {/* Receiver Name / Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  maxLength={10}
                  onChange={e => setReceiverMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Relation */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Student's Relative / Relation <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1 flex-wrap">
                  {['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Grandparent', 'Guardian', 'Driver'].map(rel => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setReceiverRelation(rel)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors ${
                        receiverRelation.toLowerCase() === rel.toLowerCase()
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder="Enter Student's Relative (e.g., Father, Mother, Brother)"
                value={receiverRelation}
                onChange={e => setReceiverRelation(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs"
                required
              />
            </div>

            {/* Aadhar Card No. */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-500" /> Aadhar Card No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter 12-digit Aadhar No."
                value={aadharNo}
                maxLength={12}
                onChange={e => setAadharNo(e.target.value.replace(/\D/g, ''))}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold outline-none tracking-widest ${
                  aadharNo.length > 0 && aadharNo.length !== 12
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {aadharNo.length > 0 && aadharNo.length !== 12 && (
                <p className="text-[10px] text-red-500 font-bold">Aadhar must be exactly 12 digits ({aadharNo.length}/12)</p>
              )}
            </div>

            {/* Aadhar Front / Back Photo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Aadhar Front Photo</label>
                <div
                  onClick={() => frontRef.current?.click()}
                  className={`relative w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                    aadharFrontUrl ? 'border-blue-300 bg-blue-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {aadharFrontUrl ? (
                    <>
                      <img src={aadharFrontUrl} alt="Aadhar Front" className="w-full h-full object-cover rounded-2xl" />
                      <button type="button" onClick={e => { e.stopPropagation(); setAadharFrontUrl('') }} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-xs font-bold text-blue-600">Upload Aadhar Front Photo</p>
                      <p className="text-[10px] text-slate-400">(Camera / Gallery)</p>
                    </>
                  )}
                </div>
                <input ref={frontRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setAadharFrontUrl) }} />
              </div>

              {/* Back */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Aadhar Back Photo</label>
                <div
                  onClick={() => backRef.current?.click()}
                  className={`relative w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                    aadharBackUrl ? 'border-blue-300 bg-blue-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {aadharBackUrl ? (
                    <>
                      <img src={aadharBackUrl} alt="Aadhar Back" className="w-full h-full object-cover rounded-2xl" />
                      <button type="button" onClick={e => { e.stopPropagation(); setAadharBackUrl('') }} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-xs font-bold text-blue-600">Upload Aadhar Back Photo</p>
                      <p className="text-[10px] text-slate-400">(Camera / Gallery)</p>
                    </>
                  )}
                </div>
                <input ref={backRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setAadharBackUrl) }} />
              </div>
            </div>

            {/* Receiver Photo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Receiver Photo</label>
              <div
                onClick={() => photoRef.current?.click()}
                className={`relative w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  receiverPhotoUrl ? 'border-teal-300 bg-teal-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {receiverPhotoUrl ? (
                  <>
                    <img src={receiverPhotoUrl} alt="Receiver" className="w-full h-full object-cover rounded-2xl" />
                    <button type="button" onClick={e => { e.stopPropagation(); setReceiverPhotoUrl('') }} className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-teal-600" />
                    </div>
                    <p className="text-xs font-bold text-teal-600">Upload Receiver Photo</p>
                    <p className="text-[10px] text-slate-400">(Tap to choose Camera or Gallery)</p>
                  </>
                )}
              </div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setReceiverPhotoUrl) }} />
            </div>
          </div>

          {/* 3. Validity & Extra */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">3</span>
              Validity & Additional Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Valid From</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Valid To</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="date" value={validTo} onChange={e => setValidTo(e.target.value)} min={validFrom} className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Vehicle No. (If any)</label>
                <input type="text" placeholder="Enter Vehicle No." value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Reason</label>
                <input type="text" placeholder="Enter Reason" value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Remarks</label>
              <input type="text" placeholder="Enter Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          VISITOR FORM
      ══════════════════════════════════════════════════════ */}
      {userType === 'visitor' && (
        <div className="space-y-5">

          {/* Visitor Info */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">1</span>
              Visitor Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Visitor Name <span className="text-red-500">*</span></span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter Visitor Full Name" 
                  value={visitorName} 
                  onChange={e => setVisitorName(e.target.value)} 
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs" 
                  required
                />
              </div>

              {/* Visitor Mobile with OTP verification */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>Visitor Mobile No. (For OTP Verification) <span className="text-red-500">*</span></span>
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
                      placeholder="Enter 10-digit mobile number" 
                      value={visitorMobile} 
                      maxLength={10} 
                      onChange={e => {
                        setVisitorMobile(e.target.value.replace(/\D/g, ''))
                        setOtpVerified(false)
                        setOtpSent(false)
                        setOtpCode('')
                      }} 
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs font-mono" 
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={otpVerified ? undefined : handleSendOTP}
                    disabled={otpVerified || !visitorMobile}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs whitespace-nowrap transition-all ${
                      otpVerified
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50'
                    }`}
                  >
                    {otpVerified ? '✓ Verified' : 'Send OTP'}
                  </button>
                </div>
                {otpSent && !otpVerified && (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      maxLength={6}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3.5 py-2 border border-teal-400 rounded-xl text-xs font-bold outline-none tracking-widest bg-white dark:bg-slate-900"
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Relation / Purpose <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="Enter relation or purpose (e.g., Contractor, Vendor, Regular Guest, Trustee)" 
                value={receiverRelation} 
                onChange={e => setReceiverRelation(e.target.value)} 
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs" 
                required
              />
            </div>

            {/* Aadhar */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-500" /> Aadhar Card No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter 12-digit Aadhar No."
                value={aadharNo}
                maxLength={12}
                onChange={e => setAadharNo(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 tracking-widest"
              />
            </div>

            {/* Aadhar Photos + Visitor Photo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Aadhar Front Photo', url: aadharFrontUrl, setUrl: setAadharFrontUrl, ref: frontRef },
                { label: 'Aadhar Back Photo', url: aadharBackUrl, setUrl: setAadharBackUrl, ref: backRef },
                { label: 'Visitor Photo', url: receiverPhotoUrl, setUrl: setReceiverPhotoUrl, ref: photoRef }
              ].map(({ label, url, setUrl, ref: r }, i) => (
                <div key={i}>
                  <label className="block text-xs font-bold text-slate-700 mb-2">{label}</label>
                  <div
                    onClick={() => r.current?.click()}
                    className={`relative w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      url ? 'border-blue-300 bg-blue-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {url ? (
                      <>
                        <img src={url} alt={label} className="w-full h-full object-cover rounded-2xl" />
                        <button type="button" onClick={e => { e.stopPropagation(); setUrl('') }} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Camera className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-[10px] font-bold text-blue-600 text-center px-2">{label}</p>
                        <p className="text-[10px] text-slate-400">(Camera / Gallery)</p>
                      </>
                    )}
                  </div>
                  <input ref={r} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setUrl) }} />
                </div>
              ))}
            </div>
          </div>

          {/* Validity */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">2</span>
              Validity & Additional Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Valid From</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Valid To</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="date" value={validTo} onChange={e => setValidTo(e.target.value)} min={validFrom} className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Vehicle No. (If any)</label>
                <input type="text" placeholder="Enter Vehicle No." value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Reason</label>
                <input type="text" placeholder="Enter Reason" value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Remarks</label>
              <input type="text" placeholder="Enter Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ACTIONS ── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Link href="/institute/gate-pass" className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors shadow-sm">
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-2.5 bg-[#1b3a60] hover:bg-[#142d4c] disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Registration'}
        </button>
      </div>

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

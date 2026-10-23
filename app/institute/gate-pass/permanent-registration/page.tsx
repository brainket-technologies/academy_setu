'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  ArrowLeft, Camera, X, CheckCircle2,
  ChevronDown, Users, User, Loader2, Phone,
  Shield, CreditCard, Calendar, Upload
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchStudents } from '@/app/institute/students/actions'
import { createOneTimeGatePass } from '@/app/institute/gate-pass/actions'

type PassUserType = 'student' | 'visitor'

export default function PermanentRegistrationPage() {
  const router = useRouter()

  const [userType, setUserType] = useState<PassUserType>('student')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })

  // ── Students ──
  const [allStudents, setAllStudents] = useState<any[]>([])

  // ── Student fields ──
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // ── Receiver ──
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

  // Load students
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchStudents()
        if (res?.success && Array.isArray(res.data)) setAllStudents(res.data)
        else {
          const local = localStorage.getItem('school_students')
          if (local) setAllStudents(JSON.parse(local))
        }
      } catch {
        const local = localStorage.getItem('school_students')
        if (local) setAllStudents(JSON.parse(local))
      }
    }
    load()
  }, [])

  const classOptions = useMemo(() =>
    Array.from(new Set(allStudents.map(s => s.class_name || s.className || s.class).filter(Boolean))) as string[]
  , [allStudents])

  const sectionOptions = useMemo(() => {
    const base = selectedClass
      ? allStudents.filter(s => String(s.class_name || s.className || s.class || '').toLowerCase() === selectedClass.toLowerCase())
      : allStudents
    return Array.from(new Set(base.map(s => s.section_name || s.sectionName || s.section).filter(Boolean))) as string[]
  }, [allStudents, selectedClass])

  const filteredStudents = useMemo(() =>
    allStudents.filter(s => {
      const sc = String(s.class_name || s.className || s.class || '').toLowerCase()
      const ss = String(s.section_name || s.sectionName || s.section || '').toLowerCase()
      return (!selectedClass || sc === selectedClass.toLowerCase()) &&
             (!selectedSection || ss === selectedSection.toLowerCase())
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
    if (parentsMobile.length < 10) { showToast('Enter a valid 10-digit mobile number.', 'error'); return }
    setOtpSent(true)
    showToast(`OTP sent to ${parentsMobile}`, 'success')
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
      <div className="bg-gradient-to-r from-[#1b3a60] to-[#0d8065] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          onClick={() => setUserType('student')}
          className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            userType === 'student' ? 'bg-[#1b3a60] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" /> Student's Relative
        </button>
        <button
          type="button"
          onClick={() => setUserType('visitor')}
          className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            userType === 'visitor' ? 'bg-[#1b3a60] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" /> Visitor
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
              <div className="flex items-center gap-3 p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-[#1b3a60] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {(selectedStudent.first_name || selectedStudent.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm text-slate-900 truncate">
                    {`${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim() || selectedStudent.name}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {selectedClass} · Sec {selectedSection} &nbsp;|&nbsp; Roll: {selectedStudent.roll_no || selectedStudent.rollNo || '—'} &nbsp;|&nbsp; Adm: {selectedStudent.admission_no || selectedStudent.admissionNo || '—'}
                  </p>
                </div>
                <button type="button" onClick={() => setSelectedStudent(null)} className="ml-auto text-slate-400 hover:text-red-500 p-1 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Receiver Details */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">2</span>
              Receiver Details
            </h2>

            {/* Parents Mobile + OTP */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Parents Mobile No. <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={parentsMobile}
                    maxLength={10}
                    onChange={e => setParentsMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={otpVerified ? undefined : handleSendOTP}
                  disabled={otpVerified}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm whitespace-nowrap transition-all ${
                    otpVerified ? 'bg-emerald-500 text-white cursor-default' : 'bg-[#0d8065] hover:bg-[#0a6c55] text-white'
                  }`}
                >
                  {otpVerified ? '✓ Verified' : 'Send OTP'}
                </button>
              </div>
              {otpSent && !otpVerified && (
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otpCode}
                    maxLength={6}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-4 py-2.5 border border-teal-400 rounded-xl text-xs font-bold outline-none tracking-widest"
                  />
                  <button type="button" onClick={handleVerifyOTP} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold">Confirm OTP</button>
                </div>
              )}
            </div>

            {/* Receiver Name / Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Receiver Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter Receiver Name"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Receiver Mobile No. <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="Enter Mobile No."
                  value={receiverMobile}
                  maxLength={10}
                  onChange={e => setReceiverMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Relation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Student's Relative <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Enter Student's Relative (e.g., Father, Brother)"
                value={receiverRelation}
                onChange={e => setReceiverRelation(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
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
                <label className="text-xs font-bold text-slate-700">Visitor Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Visitor Name" value={visitorName} onChange={e => setVisitorName(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Mobile No. <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="tel" placeholder="Enter Mobile No." value={visitorMobile} maxLength={10} onChange={e => setVisitorMobile(e.target.value.replace(/\D/g, ''))} className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Relation / Purpose</label>
              <input type="text" placeholder="Enter relation or purpose" value={receiverRelation} onChange={e => setReceiverRelation(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500" />
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

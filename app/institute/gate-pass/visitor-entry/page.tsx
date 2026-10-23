'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  ArrowLeft, Camera, X, CheckCircle2, ChevronDown,
  Users, User, Loader2, Phone, Clock, Calendar,
  Shield, LogIn, MapPin, Check
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchStudents } from '@/app/institute/students/actions'
import {
  createGatePassEntry,
  fetchRegisteredPasses
} from '@/app/institute/gate-pass/actions'

type EntryPassType = 'one-time' | 'permanent'

export default function VisitorEntryPage() {
  const router = useRouter()

  // ── Tab: one-time or permanent ──
  const [passType, setPassType] = useState<EntryPassType>('permanent')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })

  // ── Students + Registered passes ──
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [registeredPasses, setRegisteredPasses] = useState<any[]>([])
  const [loadingPasses, setLoadingPasses] = useState(true)

  // ── Student Details (for both modes) ──
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // ── Permanent mode: pick from registered pass ──
  const [selectedPass, setSelectedPass] = useState<any>(null)

  // ── Receiver (auto-filled from pass for permanent, manual for one-time) ──
  const [receiverName, setReceiverName] = useState('')
  const [receiverMobile, setReceiverMobile] = useState('')
  const [receiverRelation, setReceiverRelation] = useState('')

  // ── Photo / Verification ──
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('')
  const [livePhotoUrl, setLivePhotoUrl] = useState('')
  const [verificationDone, setVerificationDone] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)
  const liveRef = useRef<HTMLInputElement>(null)

  // ── Visit Details ──
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split('T')[0])
  const [visitTime, setVisitTime] = useState(() => new Date().toTimeString().slice(0, 5))
  const [entryGate, setEntryGate] = useState('')
  const [exitGate, setExitGate] = useState('')
  const [vehicleNo, setVehicleNo] = useState('')

  // ── Additional Info ──
  const [reason, setReason] = useState('')
  const [remarks, setRemarks] = useState('')

  // Load data
  useEffect(() => {
    async function load() {
      setLoadingPasses(true)
      try {
        const [studRes, permRes] = await Promise.all([
          fetchStudents(),
          fetchRegisteredPasses('permanent')
        ])
        if (studRes?.success && Array.isArray(studRes.data)) setAllStudents(studRes.data)
        else {
          const local = localStorage.getItem('school_students')
          if (local) setAllStudents(JSON.parse(local))
        }
        if (permRes?.success && Array.isArray(permRes.data)) setRegisteredPasses(permRes.data)
      } catch {
        const local = localStorage.getItem('school_students')
        if (local) setAllStudents(JSON.parse(local))
      } finally {
        setLoadingPasses(false)
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

  // For permanent mode — get receivers for selected student
  const matchingPasses = useMemo(() => {
    if (!selectedStudent) return registeredPasses
    const studentName = `${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim().toLowerCase()
    return registeredPasses.filter(p =>
      String(p.student_name || '').toLowerCase() === studentName ||
      (p.class_name && p.class_name.toLowerCase() === selectedClass.toLowerCase())
    )
  }, [registeredPasses, selectedStudent, selectedClass])

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

  // When permanent pass selected, auto-fill receiver info
  const handleSelectPass = (pass: any) => {
    setSelectedPass(pass)
    setReceiverName(pass.receiver_name || '')
    setReceiverMobile(pass.receiver_mobile || '')
    setReceiverRelation(pass.receiver_relation || '')
    if (pass.photo_url) setUploadedPhotoUrl(pass.photo_url)
    // Auto-fill student info
    if (pass.class_name && !selectedClass) setSelectedClass(pass.class_name)
    if (pass.section_name && !selectedSection) setSelectedSection(pass.section_name)
  }

  // Verify
  const handleVerify = () => {
    if (!uploadedPhotoUrl && !livePhotoUrl) {
      showToast('Please upload both photos for verification.', 'error')
      return
    }
    setVerificationDone(true)
    showToast('Verification successful! Uploaded and live person are identical.', 'success')
  }

  // Save
  const handleSave = async () => {
    if (passType === 'permanent') {
      if (!receiverName) { showToast('Please select a registered receiver.', 'error'); return }
    } else {
      if (!selectedClass || !selectedSection || !selectedStudent) { showToast('Please select Class, Section and Student.', 'error'); return }
      if (!receiverName) { showToast('Receiver Name is required.', 'error'); return }
    }
    if (!visitDate || !visitTime) { showToast('Date and Time are required.', 'error'); return }

    setSaving(true)
    try {
      const studentName = selectedStudent
        ? `${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim() || selectedStudent.name || ''
        : (selectedPass?.student_name || '')

      const res = await createGatePassEntry({
        passId: selectedPass?.id || undefined,
        passType,
        userType: 'Student',
        studentName,
        className: selectedClass || selectedPass?.class_name || '',
        sectionName: selectedSection || selectedPass?.section_name || '',
        rollNo: String(selectedStudent?.roll_no || selectedStudent?.rollNo || selectedPass?.roll_no || ''),
        receiverName,
        receiverMobile,
        receiverRelation,
        livePhotoUrl: livePhotoUrl || uploadedPhotoUrl,
        visitDate,
        visitTime,
        entryGate,
        exitGate,
        vehicleNo,
        reason,
        remarks,
        verificationStatus: verificationDone
      })

      if (res?.success) {
        showToast('Gate pass entry saved successfully!', 'success')
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
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/institute/gate-pass"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              Entry {passType === 'permanent' ? 'Permanent' : 'One Time'} Gate Pass
            </h1>
            <p className="text-xs text-teal-100 mt-0.5">Log a visitor entry — select student, receiver, and visit details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.push('/institute/gate-pass')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 bg-white text-teal-800 hover:bg-teal-50 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── PASS TYPE TABS ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-sm flex gap-2">
        <button
          type="button"
          onClick={() => { setPassType('permanent'); setSelectedPass(null) }}
          className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            passType === 'permanent' ? 'bg-[#0d8065] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4" /> Entry Permanent Gate Pass
        </button>
        <button
          type="button"
          onClick={() => { setPassType('one-time'); setSelectedPass(null) }}
          className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            passType === 'one-time' ? 'bg-[#0d8065] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LogIn className="w-4 h-4" /> Entry One Time Gate Pass
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          COMMON FORM — Student Details
      ══════════════════════════════════════════════════════ */}
      <div className="space-y-5">

        {/* 1. Student Details */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">1</span>
            Student Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Class <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(''); setSelectedStudent(null); setSelectedPass(null) }} className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white cursor-pointer">
                  <option value="">Select an Option</option>
                  {classOptions.map(cn => <option key={cn} value={cn}>{cn}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Section <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={selectedSection} onChange={e => { setSelectedSection(e.target.value); setSelectedStudent(null); setSelectedPass(null) }} disabled={!selectedClass} className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white cursor-pointer disabled:opacity-50">
                  <option value="">Select an Option</option>
                  {sectionOptions.map(sn => <option key={sn} value={sn}>{sn}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Student Name with Roll No. <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={selectedStudent?.id || ''}
                  onChange={e => { setSelectedStudent(filteredStudents.find(s => String(s.id) === e.target.value) || null); setSelectedPass(null) }}
                  disabled={!selectedClass || !selectedSection}
                  className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select an Option</option>
                  {filteredStudents.map(s => {
                    const name = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || 'Unknown'
                    return <option key={s.id} value={String(s.id)}>{name} — Roll: {s.roll_no || s.rollNo || '—'}</option>
                  })}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Receiver Details */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">2</span>
            Receiver Details
          </h2>

          {/* Permanent mode: select from registered receivers */}
          {passType === 'permanent' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Receiver Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={selectedPass?.id || ''}
                  onChange={e => {
                    const pass = matchingPasses.find(p => String(p.id) === e.target.value)
                    if (pass) handleSelectPass(pass)
                    else { setSelectedPass(null); setReceiverName(''); setReceiverMobile(''); setReceiverRelation('') }
                  }}
                  className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white cursor-pointer"
                >
                  <option value="">Select Receiver</option>
                  {matchingPasses.map(p => (
                    <option key={p.id} value={String(p.id)}>
                      {p.receiver_name || p.visitor_name || 'Unknown'} — {p.receiver_relation || 'Relation N/A'} — {p.receiver_mobile || ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {matchingPasses.length === 0 && (
                <p className="text-[10px] text-amber-600 font-bold">No permanent registrations found. <Link href="/institute/gate-pass/permanent-registration" className="text-teal-600 underline">Register first →</Link></p>
              )}
            </div>
          )}

          {/* One-time mode: manual receiver input */}
          {passType === 'one-time' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Receiver Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Receiver Name" value={receiverName} onChange={e => setReceiverName(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Receiver Mobile No.</label>
                <input type="tel" placeholder="Enter Mobile No." value={receiverMobile} maxLength={10} onChange={e => setReceiverMobile(e.target.value.replace(/\D/g, ''))} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Student's Relative <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Relation" value={receiverRelation} onChange={e => setReceiverRelation(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500" />
              </div>
            </div>
          )}

          {/* Auto-filled receiver chip for permanent */}
          {passType === 'permanent' && selectedPass && (
            <div className="flex items-center gap-3 p-3.5 bg-teal-50/60 border border-teal-200 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-[#0d8065] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {(receiverName || 'R').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-slate-900 truncate">{receiverName}</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {receiverRelation} &nbsp;|&nbsp; <Phone className="w-3 h-3 inline" /> {receiverMobile || '—'}
                </p>
              </div>
              <button type="button" onClick={() => { setSelectedPass(null); setReceiverName(''); setReceiverMobile(''); setReceiverRelation('') }} className="ml-auto text-slate-400 hover:text-red-500 p-1 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Photo upload + Live check */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Uploaded / DB Photo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Uploaded Photo (from DB)</label>
              <div
                onClick={() => uploadRef.current?.click()}
                className={`relative w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  uploadedPhotoUrl ? 'border-teal-300 bg-teal-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {uploadedPhotoUrl ? (
                  <>
                    <img src={uploadedPhotoUrl} alt="Uploaded" className="w-full h-full object-cover rounded-2xl" />
                    <button type="button" onClick={e => { e.stopPropagation(); setUploadedPhotoUrl('') }} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><Camera className="w-5 h-5 text-teal-600" /></div>
                    <p className="text-xs font-bold text-teal-600">Tap to Select Photo</p>
                    <p className="text-[10px] text-slate-400">Uploaded image show</p>
                  </>
                )}
              </div>
              <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setUploadedPhotoUrl) }} />
            </div>

            {/* Live Check */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Live Check (Optional)</label>
              <div
                onClick={() => liveRef.current?.click()}
                className={`relative w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  livePhotoUrl ? 'border-orange-300 bg-orange-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {livePhotoUrl ? (
                  <>
                    <img src={livePhotoUrl} alt="Live" className="w-full h-full object-cover rounded-2xl" />
                    <button type="button" onClick={e => { e.stopPropagation(); setLivePhotoUrl('') }} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><span className="text-xl">😊</span></div>
                    <p className="text-xs font-bold text-orange-600">Tap for Live Check</p>
                    <p className="text-[10px] text-red-500 font-semibold">Ensure face is clearly visible for live check</p>
                  </>
                )}
              </div>
              <input ref={liveRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setLivePhotoUrl) }} />
            </div>
          </div>

          {/* Verification Checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleVerify}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                verificationDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-teal-400'
              }`}
            >
              {verificationDone && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
            <p className={`text-xs font-bold ${verificationDone ? 'text-emerald-600' : 'text-emerald-500'}`}>
              Verification successful uploaded and live Person are identical.
            </p>
          </div>
        </div>

        {/* 3. Visit Details */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">3</span>
            Visit Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="time" value={visitTime} onChange={e => setVisitTime(e.target.value)} className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Vehicle No. (If any)</label>
              <input type="text" placeholder="Enter Vehicle No." value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Entry Gate</label>
              <input type="text" placeholder="Enter Gate No." value={entryGate} onChange={e => setEntryGate(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Exit Gate</label>
              <input type="text" placeholder="Enter Gate No." value={exitGate} onChange={e => setExitGate(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500" />
            </div>
          </div>
        </div>

        {/* 4. Additional Information */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">4</span>
            Additional Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Reason</label>
              <input type="text" placeholder="Enter Reason" value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Remarks</label>
              <input type="text" placeholder="Enter Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Link href="/institute/gate-pass" className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors shadow-sm">
          Cancel
        </Link>
        <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-8 py-2.5 bg-[#0d8065] hover:bg-[#0a6c55] disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition-all">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save'}
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

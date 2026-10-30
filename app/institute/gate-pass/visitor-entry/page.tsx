'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  ArrowLeft, Camera, X, CheckCircle2, ChevronDown,
  Users, User, Loader2, Phone, Clock, Calendar,
  Shield, LogIn, MapPin, Check, Search, AlertCircle, Plus,
  ShieldCheck, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchStudents } from '@/app/institute/students/actions'
import {
  createGatePassEntry,
  fetchRegisteredPasses
} from '@/app/institute/gate-pass/actions'
import { useClasses, useSections } from '@/lib/mastersData'

// ── Searchable Select Types & Component ──
interface SearchableOption {
  value: string
  label: string
  sublabel?: string
  badge?: string
  photo?: string
  icon?: React.ReactNode
  data?: any
}

interface SearchableSelectProps {
  label?: React.ReactNode
  placeholder?: string
  searchPlaceholder?: string
  options: SearchableOption[]
  value: string
  onChange: (value: string, option?: SearchableOption) => void
  disabled?: boolean
  disabledMessage?: string
  emptyMessage?: string
  emptyAction?: React.ReactNode
  allowCustom?: boolean
  className?: string
  helperText?: React.ReactNode
  required?: boolean
}

function SearchableSelect({
  label,
  placeholder = 'Select an Option',
  searchPlaceholder = 'Search...',
  options = [],
  value,
  onChange,
  disabled = false,
  disabledMessage,
  emptyMessage = 'No options found',
  emptyAction,
  allowCustom = false,
  className = '',
  helperText,
  required = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return options.find(o => o.value === value || o.label === value)
  }, [options, value])

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return options
    return options.filter(opt => {
      const labelMatch = opt.label?.toLowerCase().includes(q)
      const subMatch = opt.sublabel?.toLowerCase().includes(q)
      const badgeMatch = opt.badge?.toLowerCase().includes(q)
      const valMatch = opt.value?.toLowerCase().includes(q)
      return labelMatch || subMatch || badgeMatch || valMatch
    })
  }, [options, searchTerm])

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt.value, opt)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  const handleCustomSelect = () => {
    if (!searchTerm.trim()) return
    onChange(searchTerm.trim(), { value: searchTerm.trim(), label: searchTerm.trim() })
    setIsOpen(false)
  }

  const displayLabel = selectedOption ? selectedOption.label : value

  return (
    <div className={`flex flex-col gap-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {helperText && <span className="text-[10px] text-slate-400 font-normal">{helperText}</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-xs font-semibold flex items-center justify-between transition-all shadow-2xs text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'border-teal-500 ring-2 ring-teal-500/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        } ${value ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {selectedOption?.photo ? (
            <img
              src={selectedOption.photo}
              alt={displayLabel}
              className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-300"
            />
          ) : selectedOption?.icon ? (
            <span className="shrink-0 text-slate-400">{selectedOption.icon}</span>
          ) : null}

          <span className="truncate">{displayLabel || (disabled && disabledMessage ? disabledMessage : placeholder)}</span>

          {selectedOption?.badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              onClick={handleClear}
              title="Clear selection"
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-600' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-72">
          
          {/* Search Bar inside dropdown */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto p-1.5 flex-1 divide-y divide-slate-50 dark:divide-slate-700/50">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-4 text-center">
                <p className="text-xs text-slate-400 font-semibold">{emptyMessage}</p>
                {emptyAction && <div className="mt-2 flex justify-center">{emptyAction}</div>}
                {allowCustom && searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={handleCustomSelect}
                    className="mt-3 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Use "{searchTerm.trim()}"
                  </button>
                )}
              </div>
            ) : (
              <>
                {filteredOptions.map(opt => {
                  const isSelected = value === opt.value || (!value && !opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className={`w-full px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-bold'
                          : 'text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {opt.photo ? (
                          <img
                            src={opt.photo}
                            alt={opt.label}
                            className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-200"
                          />
                        ) : opt.icon ? (
                          <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 text-slate-500">
                            {opt.icon}
                          </span>
                        ) : null}

                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-bold text-slate-900 dark:text-white">{opt.label}</span>
                            {opt.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 shrink-0">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          {opt.sublabel && (
                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{opt.sublabel}</p>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 ml-2" />
                      )}
                    </button>
                  )
                })}

                {allowCustom && searchTerm.trim() && !filteredOptions.some(o => o.label.toLowerCase() === searchTerm.toLowerCase().trim()) && (
                  <div className="pt-2 px-1">
                    <button
                      type="button"
                      onClick={handleCustomSelect}
                      className="w-full px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Use custom: "{searchTerm.trim()}"
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function VisitorEntryPage() {
  const router = useRouter()
  const classesData = useClasses()
  const sectionsData = useSections()

  const passType = 'permanent' as const
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })

  // ── Students + Registered passes ──
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [registeredPasses, setRegisteredPasses] = useState<any[]>([])
  const [loadingPasses, setLoadingPasses] = useState(true)

  // ── Student Details ──
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // ── Permanent mode: pick from registered pass ──
  const [selectedPass, setSelectedPass] = useState<any>(null)

  // ── Receiver (auto-filled from verified permanent pass) ──
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
  const [entryGate, setEntryGate] = useState('Main Gate')
  const [exitGate, setExitGate] = useState('Main Gate')
  const [vehicleNo, setVehicleNo] = useState('')

  // ── Additional Info ──
  const [reason, setReason] = useState('')
  const [remarks, setRemarks] = useState('')

  // Load data (students & permanent registered passes)
  useEffect(() => {
    async function load() {
      setLoadingPasses(true)
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
        const [studRes, permRes] = await Promise.all([
          fetchStudents(),
          fetchRegisteredPasses('permanent')
        ])
        if (studRes?.success && Array.isArray(studRes.data) && studRes.data.length > 0) {
          const dbStudents = studRes.data
          const dbIds = new Set(dbStudents.map((s: any) => String(s.id || s.admission_no || s.admissionNo)))
          const uniqueLocal = localStudents.filter((s: any) => !dbIds.has(String(s.id || s.admission_no || s.admissionNo)))
          setAllStudents([...dbStudents, ...uniqueLocal])
        } else if (localStudents.length > 0) {
          setAllStudents(localStudents)
        }

        const localPasses = parseLocal('school_gate_passes').filter((p: any) => (p.passType || p.pass_type) === 'permanent')
        const dbPasses = (permRes?.success && Array.isArray(permRes.data)) ? permRes.data : []
        const dbIds = new Set(dbPasses.map((p: any) => String(p.id)))
        const uniqueLocalPasses = localPasses.filter((p: any) => !dbIds.has(String(p.id)))
        const rawCombined = [...dbPasses, ...uniqueLocalPasses]

        // Normalize each pass for uniform access
        const normalized = rawCombined.map(p => ({
          ...p,
          id: p.id || `perm-${Math.random()}`,
          student_name: p.student_name || p.studentName || '',
          class_name: p.class_name || p.className || '',
          section_name: p.section_name || p.sectionName || '',
          roll_no: String(p.roll_no || p.rollNo || ''),
          admission_no: p.admission_no || p.admissionNo || '',
          receiver_name: p.receiver_name || p.receiverName || p.visitor_name || p.visitorName || '',
          receiver_mobile: p.receiver_mobile || p.receiverMobile || p.contact || p.parents_mobile || p.visitorMobile || '',
          receiver_relation: p.receiver_relation || p.receiverRelation || 'Authorized',
          photo_url: p.photo_url || p.photoUrl || ''
        }))

        setRegisteredPasses(normalized)
      } catch {
        if (localStudents.length > 0) setAllStudents(localStudents)
        const localPasses = parseLocal('school_gate_passes').filter((p: any) => (p.passType || p.pass_type) === 'permanent')
        setRegisteredPasses(localPasses)
      } finally {
        setLoadingPasses(false)
      }
    }
    load()
  }, [])

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
    return Array.from(set).sort()
  }, [classesData, allStudents])

  // Section options from Master & Students based on selectedClass
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
    return Array.from(set).sort()
  }, [selectedClass, sectionsData, classesData, allStudents])

  // Filter students by selectedClass and selectedSection
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

  // ── MATCHING VISITORS FOR SELECTED STUDENT ──
  // STRICT FILTER: after selecting student, show ONLY visitors created related to that student!
  const matchingPasses = useMemo(() => {
    if (!selectedStudent) {
      // If no student is selected yet, show all registered permanent passes for general lookup
      return registeredPasses
    }

    const sFirst = (selectedStudent.first_name || '').trim().toLowerCase()
    const sLast = (selectedStudent.last_name || '').trim().toLowerCase()
    const sFullName = `${sFirst} ${sLast}`.trim() || (selectedStudent.name || '').trim().toLowerCase()
    const sRoll = String(selectedStudent.roll_no || selectedStudent.rollNo || '').trim().toLowerCase()
    const sAdm = String(selectedStudent.admission_no || selectedStudent.admissionNo || '').trim().toLowerCase()
    const sClassNorm = (selectedClass || selectedStudent.class_name || selectedStudent.className || '').replace(/\s*\(.*?\)/g, '').trim().toLowerCase()
    const sSecNorm = (selectedSection || selectedStudent.section_name || selectedStudent.sectionName || '').trim().toLowerCase()

    const matches = registeredPasses.filter(p => {
      const pName = String(p.student_name || p.studentName || '').trim().toLowerCase()
      const pRoll = String(p.roll_no || p.rollNo || '').trim().toLowerCase()
      const pAdm = String(p.admission_no || p.admissionNo || '').trim().toLowerCase()
      const pClassNorm = String(p.class_name || p.className || '').replace(/\s*\(.*?\)/g, '').trim().toLowerCase()
      const pSecNorm = String(p.section_name || p.sectionName || '').trim().toLowerCase()

      // 1. Direct Name Match
      const nameMatch = Boolean(pName && sFullName && (pName === sFullName || pName.includes(sFullName) || sFullName.includes(pName)))
      // 2. Roll match within same class
      const rollMatch = Boolean(sRoll && pRoll && pRoll === sRoll && (!sClassNorm || !pClassNorm || sClassNorm === pClassNorm))
      // 3. Admission number match
      const admMatch = Boolean(sAdm && pAdm && pAdm === sAdm)
      // 4. Linked student ID
      const idMatch = Boolean(selectedStudent.id && (p.student_id || p.studentId) && String(selectedStudent.id) === String(p.student_id || p.studentId))

      return nameMatch || rollMatch || admMatch || idMatch
    })

    // Return STRICTLY matches for this student! (Never fall back to other students' passes)
    return matches
  }, [registeredPasses, selectedStudent, selectedClass, selectedSection])

  // Auto-populate visitor if exactly 1 matching visitor is registered for this student
  useEffect(() => {
    if (selectedStudent && matchingPasses.length === 1 && !selectedPass) {
      handleSelectPass(matchingPasses[0])
    }
  }, [selectedStudent, matchingPasses])

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
    setReceiverName(pass.receiver_name || pass.receiverName || pass.visitor_name || pass.visitorName || '')
    setReceiverMobile(pass.receiver_mobile || pass.receiverMobile || pass.contact || pass.parents_mobile || '')
    setReceiverRelation(pass.receiver_relation || pass.receiverRelation || 'Authorized')
    if (pass.photo_url || pass.photoUrl) setUploadedPhotoUrl(pass.photo_url || pass.photoUrl)
    
    // Auto-fill student info if not selected yet
    if (pass.class_name && !selectedClass) setSelectedClass(pass.class_name)
    if (pass.section_name && !selectedSection) setSelectedSection(pass.section_name)
    if (pass.student_name && !selectedStudent) {
      const foundS = allStudents.find(s => {
        const n = `${s.first_name || ''} ${s.last_name || ''}`.trim().toLowerCase()
        return n && (n === pass.student_name.toLowerCase() || pass.student_name.toLowerCase().includes(n))
      })
      if (foundS) setSelectedStudent(foundS)
    }
  }

  // Reset selected receiver
  const handleClearReceiver = () => {
    setSelectedPass(null)
    setReceiverName('')
    setReceiverMobile('')
    setReceiverRelation('')
    setUploadedPhotoUrl('')
    setVerificationDone(false)
  }

  // Verify
  const handleVerify = () => {
    if (!uploadedPhotoUrl && !livePhotoUrl) {
      showToast('Please upload or select a photo for verification.', 'error')
      return
    }
    setVerificationDone(true)
    showToast('Verification successful! Uploaded and live person are identical.', 'success')
  }

  // Save Gate Pass Entry
  const handleSave = async () => {
    if (!receiverName) {
      showToast('Please select a registered receiver / visitor.', 'error')
      return
    }
    if (!visitDate || !visitTime) {
      showToast('Date and Time are required.', 'error')
      return
    }

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
        // Also persist locally for immediate reflection
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('school_gate_pass_entries')
            const existing = raw ? JSON.parse(raw) : []
            const newEntry = {
              id: res.data?.id || `entry-${Date.now()}`,
              pass_type: 'permanent',
              user_type: 'Student',
              student_name: studentName,
              class_name: selectedClass || selectedPass?.class_name || '',
              section_name: selectedSection || selectedPass?.section_name || '',
              roll_no: String(selectedStudent?.roll_no || selectedStudent?.rollNo || selectedPass?.roll_no || ''),
              receiver_name: receiverName,
              receiver_mobile: receiverMobile,
              receiver_relation: receiverRelation,
              live_photo_url: livePhotoUrl || uploadedPhotoUrl,
              visit_date: visitDate,
              visit_time: visitTime,
              entry_gate: entryGate,
              exit_gate: exitGate,
              vehicle_no: vehicleNo,
              reason,
              remarks,
              verification_status: verificationDone,
              status: 'Checked-In',
              created_at: new Date().toISOString()
            }
            localStorage.setItem('school_gate_pass_entries', JSON.stringify([newEntry, ...existing]))
          } catch (e) {}
        }

        showToast('Permanent gate pass entry saved successfully!', 'success')
        setTimeout(() => router.push('/institute/gate-pass/entry'), 1200)
      } else {
        showToast(res?.error || 'Failed to save entry.', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Unexpected error.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── SEARCHABLE DROPDOWN OPTIONS ──

  // Class Search Options
  const classSelectOptions: SearchableOption[] = useMemo(() => {
    return classOptions.map(cls => ({
      value: cls,
      label: cls,
      icon: <Users className="w-3.5 h-3.5" />
    }))
  }, [classOptions])

  // Section Search Options
  const sectionSelectOptions: SearchableOption[] = useMemo(() => {
    return sectionOptions.map(sec => ({
      value: sec,
      label: `Section ${sec}`,
      badge: sec
    }))
  }, [sectionOptions])

  // Student Search Options
  const studentSelectOptions: SearchableOption[] = useMemo(() => {
    return filteredStudents.map(s => {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || 'Unknown Student'
      const roll = s.roll_no || s.rollNo || '—'
      const adm = s.admission_no || s.admissionNo || ''
      const sec = s.section_name || s.sectionName || ''
      return {
        value: String(s.id),
        label: name,
        sublabel: `Roll: ${roll}${adm ? ` · Adm: ${adm}` : ''}`,
        badge: sec ? `Sec ${sec}` : undefined,
        icon: <User className="w-3.5 h-3.5 text-teal-600" />,
        data: s
      }
    })
  }, [filteredStudents])

  // Receiver Search Options
  const receiverSelectOptions: SearchableOption[] = useMemo(() => {
    return matchingPasses.map(p => {
      const rName = p.receiver_name || p.receiverName || p.visitor_name || p.visitorName || 'Unknown Receiver'
      const rRel = p.receiver_relation || p.receiverRelation || 'Authorized Visitor'
      const rMob = p.receiver_mobile || p.receiverMobile || p.contact || p.parents_mobile || ''
      const forStudent = p.student_name ? `For: ${p.student_name}` : ''

      return {
        value: String(p.id),
        label: rName,
        sublabel: [rMob, !selectedStudent && forStudent].filter(Boolean).join(' · '),
        badge: rRel,
        photo: p.photo_url || p.photoUrl || '',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />,
        data: p
      }
    })
  }, [matchingPasses, selectedStudent])

  // Gate Options
  const gateOptions: SearchableOption[] = useMemo(() => [
    { value: 'Main Gate', label: 'Main Gate', badge: 'Primary', icon: <MapPin className="w-3.5 h-3.5" /> },
    { value: 'Gate No. 1', label: 'Gate No. 1', icon: <MapPin className="w-3.5 h-3.5" /> },
    { value: 'Gate No. 2', label: 'Gate No. 2', icon: <MapPin className="w-3.5 h-3.5" /> },
    { value: 'Gate No. 3', label: 'Gate No. 3', icon: <MapPin className="w-3.5 h-3.5" /> },
    { value: 'Back Gate', label: 'Back Gate', icon: <MapPin className="w-3.5 h-3.5" /> },
    { value: 'Front / Reception Gate', label: 'Front / Reception Gate', icon: <MapPin className="w-3.5 h-3.5" /> },
    { value: 'North Gate', label: 'North Gate', icon: <MapPin className="w-3.5 h-3.5" /> },
    { value: 'South Gate', label: 'South Gate', icon: <MapPin className="w-3.5 h-3.5" /> }
  ], [])

  const selectedStudentName = selectedStudent
    ? `${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim() || selectedStudent.name
    : ''

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-200">

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-[#1b3a60] to-teal-700 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/institute/gate-pass/entry"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              Entry Permanent Gate Pass
            </h1>
            <p className="text-xs text-teal-100 mt-0.5">
              Log a verified permanent visitor entry — select student to view their authorized visitors
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/institute/gate-pass/entry')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-teal-800 hover:bg-teal-50 rounded-xl text-xs font-black shadow-sm transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          FORM SECTION
      ══════════════════════════════════════════════════════ */}
      <div className="space-y-5">

        {/* 1. Student Details (With Searchable Dropdowns) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300 flex items-center justify-center text-xs font-black">1</span>
              Student Details
            </h2>
            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-full">
              Step 1: Select Student
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Searchable Class Dropdown */}
            <SearchableSelect
              label="Class"
              required
              placeholder="Search or Select Class"
              searchPlaceholder="Type to search class (e.g. Class 1)..."
              options={classSelectOptions}
              value={selectedClass}
              onChange={val => {
                setSelectedClass(val)
                setSelectedSection('')
                setSelectedStudent(null)
                handleClearReceiver()
              }}
            />

            {/* Searchable Section Dropdown */}
            <SearchableSelect
              label="Section"
              required
              placeholder="Search or Select Section"
              searchPlaceholder="Type section (e.g. A, B)..."
              disabled={!selectedClass}
              disabledMessage="Select Class first"
              options={sectionSelectOptions}
              value={selectedSection}
              onChange={val => {
                setSelectedSection(val)
                setSelectedStudent(null)
                handleClearReceiver()
              }}
            />

            {/* Searchable Student Dropdown */}
            <SearchableSelect
              label="Student Name with Roll No."
              required
              placeholder="Search or Select Student"
              searchPlaceholder="Search by student name, roll number, or admission no..."
              disabled={!selectedClass || !selectedSection}
              disabledMessage="Select Class & Section first"
              emptyMessage={selectedClass && selectedSection ? "No students found in this section" : "Select class and section to view students"}
              options={studentSelectOptions}
              value={selectedStudent?.id ? String(selectedStudent.id) : ''}
              onChange={(val, opt) => {
                const student = opt?.data || filteredStudents.find(s => String(s.id) === val) || null
                setSelectedStudent(student)
                handleClearReceiver()
              }}
            />
          </div>

          {/* Student Info Card Confirmation */}
          {selectedStudent && (
            <div className="p-3.5 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm">
                  {selectedStudentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{selectedStudentName}</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-600 text-white">
                      Enrolled
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Class: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedClass} ({selectedSection})</span>
                    &nbsp;|&nbsp; Roll No: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent.roll_no || selectedStudent.rollNo || '—'}</span>
                    {(selectedStudent.admission_no || selectedStudent.admissionNo) && (
                      <> &nbsp;|&nbsp; Admission: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent.admission_no || selectedStudent.admissionNo}</span></>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null)
                  handleClearReceiver()
                }}
                className="text-xs font-bold text-slate-400 hover:text-red-500 p-1 flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Change
              </button>
            </div>
          )}
        </div>

        {/* 2. Receiver Details (Filtered strictly by selected student) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center text-xs font-black">2</span>
              Authorized Receiver Details
            </h2>

            {selectedStudent ? (
              matchingPasses.length > 0 ? (
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full flex items-center gap-1.5 self-start">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {matchingPasses.length} permanent visitor{matchingPasses.length > 1 ? 's' : ''} registered for {selectedStudentName}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full flex items-center gap-1.5 self-start">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  No permanent visitor registered for {selectedStudentName}
                </span>
              )
            ) : (
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full self-start">
                Select a student to filter visitors
              </span>
            )}
          </div>

          {/* Searchable Receiver Dropdown */}
          <div className="space-y-2">
            <SearchableSelect
              label="Receiver Name"
              required
              placeholder={
                selectedStudent
                  ? matchingPasses.length > 0
                    ? "Search or Select Registered Visitor"
                    : `No registered visitors found for ${selectedStudentName}`
                  : "Select a student above or search any registered visitor"
              }
              searchPlaceholder="Search visitor by name, relation (e.g. Father, Mother), or phone..."
              options={receiverSelectOptions}
              value={selectedPass?.id ? String(selectedPass.id) : ''}
              onChange={(val, opt) => {
                const pass = opt?.data || matchingPasses.find(p => String(p.id) === val) || null
                if (pass) {
                  handleSelectPass(pass)
                } else {
                  handleClearReceiver()
                }
              }}
              emptyMessage={
                selectedStudent
                  ? `No permanent visitor created for ${selectedStudentName}`
                  : "No registered permanent passes found"
              }
              emptyAction={
                <Link
                  href="/institute/gate-pass/permanent-registration"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Permanent Visitor Now
                </Link>
              }
            />

            {/* When student selected but has NO visitors */}
            {selectedStudent && matchingPasses.length === 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-200 text-xs font-semibold">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    No permanent visitor is registered for <strong className="font-black">{selectedStudentName}</strong>. You must register an authorized visitor with Aadhar/photo verification.
                  </span>
                </div>
                <Link
                  href="/institute/gate-pass/permanent-registration"
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Visitor
                </Link>
              </div>
            )}
          </div>

          {/* Selected Receiver Verified Card */}
          {selectedPass && (
            <div className="flex items-center gap-3 p-3.5 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 rounded-2xl shadow-2xs animate-in fade-in duration-150">
              {uploadedPhotoUrl ? (
                <img
                  src={uploadedPhotoUrl}
                  alt={receiverName}
                  className="w-12 h-12 rounded-xl object-cover border border-teal-300 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                  {(receiverName || 'R').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">{receiverName}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                    {receiverRelation}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {receiverMobile || '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearReceiver}
                className="text-slate-400 hover:text-red-500 p-1 shrink-0"
                title="Deselect receiver"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Photo upload + Live check */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Uploaded / DB Photo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Uploaded Photo (from DB)
              </label>
              <div
                onClick={() => uploadRef.current?.click()}
                className={`relative w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  uploadedPhotoUrl ? 'border-teal-300 bg-teal-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:border-slate-700'
                }`}
              >
                {uploadedPhotoUrl ? (
                  <>
                    <img src={uploadedPhotoUrl} alt="Uploaded" className="w-full h-full object-cover rounded-2xl" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setUploadedPhotoUrl('') }}
                      className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-teal-600">Tap to Select Photo</p>
                    <p className="text-[10px] text-slate-400">Database photo will auto-populate</p>
                  </>
                )}
              </div>
              <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setUploadedPhotoUrl) }} />
            </div>

            {/* Live Check */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Live Check (Optional)
              </label>
              <div
                onClick={() => liveRef.current?.click()}
                className={`relative w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  livePhotoUrl ? 'border-orange-300 bg-orange-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:border-slate-700'
                }`}
              >
                {livePhotoUrl ? (
                  <>
                    <img src={livePhotoUrl} alt="Live" className="w-full h-full object-cover rounded-2xl" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setLivePhotoUrl('') }}
                      className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <span className="text-xl">😊</span>
                    </div>
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
            <p className={`text-xs font-bold ${verificationDone ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}>
              Verification successful: uploaded and live person are identical.
            </p>
          </div>
        </div>

        {/* 3. Visit Details (Searchable Gates + Date/Time) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 flex items-center justify-center text-xs font-black">3</span>
            Visit Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={visitDate}
                  onChange={e => setVisitDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  value={visitTime}
                  onChange={e => setVisitTime(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Vehicle No. (If any)</label>
              <input
                type="text"
                placeholder="Enter Vehicle No. (e.g. DL 01 AB 1234)"
                value={vehicleNo}
                onChange={e => setVehicleNo(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Searchable Entry Gate */}
            <SearchableSelect
              label="Entry Gate"
              placeholder="Select Entry Gate"
              searchPlaceholder="Search or type gate name..."
              options={gateOptions}
              value={entryGate}
              onChange={val => setEntryGate(val)}
              allowCustom
            />

            {/* Searchable Exit Gate */}
            <SearchableSelect
              label="Exit Gate"
              placeholder="Select Exit Gate"
              searchPlaceholder="Search or type gate name..."
              options={gateOptions}
              value={exitGate}
              onChange={val => setExitGate(val)}
              allowCustom
            />
          </div>
        </div>

        {/* 4. Additional Information */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 flex items-center justify-center text-xs font-black">4</span>
            Additional Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason / Purpose</label>
              <input
                type="text"
                placeholder="e.g. Early Pickup, Sick Leave, Fee Deposit"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Remarks</label>
              <input
                type="text"
                placeholder="Enter Remarks (optional)"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Link
          href="/institute/gate-pass/entry"
          className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl text-xs font-black shadow-sm transition-all shadow-teal-600/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save & Log Entry'}
        </button>
      </div>

      {/* ── TOAST ── */}
      {toast.open && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-200" />}
          <span className="text-xs font-bold">{toast.msg}</span>
        </div>
      )}
    </div>
  )
}

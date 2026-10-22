'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { 
  Search, Filter, Eye, Trash2, X, Calendar, Plus, Award, 
  Printer, Download, ShieldCheck, CheckCircle2, ChevronRight,
  FileCheck, Sparkles, RefreshCw, GraduationCap, School, BookOpen,
  ZoomIn, ZoomOut, RotateCcw, UserCheck, Layers, ArrowRight, Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  fetchIssuedCertificates, 
  saveIssuedCertificate, 
  deleteIssuedCertificate, 
  fetchCertificateTypes, 
  fetchStudentsForCertificate,
  CertificateTypeData,
  IssuedCertificateData
} from './actions'
import { 
  CertificateDesign1, 
  CertificateDesign2, 
  CertificateDesign3, 
  CertificateDesign4,
  CertificatePaper
} from '@/components/certificates/CertificateTemplates'

// Robust normalization helper for classes
function cleanClassString(c: string): string {
  if (!c) return ''
  let s = String(c).replace(/\([^)]*\)/g, ' ').trim()
  s = s.split(/\s*-\s*/)[0].trim()
  s = s.replace(/^(class|grade|std|standard)\s*/i, '').trim()
  return s.toLowerCase().replace(/\s+/g, '')
}

function isClassMatch(a: string, b: string): boolean {
  if (!a || !b) return false
  const cleanA = cleanClassString(a)
  const cleanB = cleanClassString(b)
  if (!cleanA || !cleanB) return false
  if (cleanA === cleanB) return true
  // Match ordinal variations e.g. "1" and "1st"
  const baseA = cleanA.replace(/(st|nd|rd|th)$/, '')
  const baseB = cleanB.replace(/(st|nd|rd|th)$/, '')
  if (baseA && baseB && baseA === baseB) return true
  return false
}


// Helper to load institute added classes (no default mock classes)
function loadInstituteAddedClasses(): string[] {
  if (typeof window === 'undefined') return []
  const classesSet = new Set<string>()

  try {
    const saved = localStorage.getItem('school_masters_classes')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        parsed
          .filter((c: any) => !c.deleted)
          .forEach((c: any) => {
            const name = (c.className || c.name || c.title || '').trim()
            if (name) classesSet.add(name)
          })
      }
    }
  } catch (e) {}

  try {
    const saved = localStorage.getItem('school_masters_sections')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        parsed
          .filter((s: any) => !s.deleted)
          .forEach((s: any) => {
            const name = (s.className || '').trim()
            if (name) classesSet.add(name)
          })
      }
    }
  } catch (e) {}

  try {
    const saved = localStorage.getItem('school_classes') || localStorage.getItem('school_institute_classes')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        parsed.forEach((c: any) => {
          const name = typeof c === 'string' ? c.trim() : (c.className || c.name || '').trim()
          if (name) classesSet.add(name)
        })
      }
    }
  } catch (e) {}

  try {
    const saved = localStorage.getItem('school_students')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        parsed.forEach((s: any) => {
          const name = (s.class || s.className || s.class_name || '').trim()
          if (name) classesSet.add(name)
        })
      }
    }
  } catch (e) {}

  try {
    const saved = localStorage.getItem('school_institute_students')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        parsed.forEach((s: any) => {
          const name = (s.class || s.className || s.class_name || '').trim()
          if (name) classesSet.add(name)
        })
      }
    }
  } catch (e) {}

  return Array.from(classesSet)
}


export default function AllCertificatePage() {
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<any[]>([])
  const [certTypes, setCertTypes] = useState<CertificateTypeData[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [addedClasses, setAddedClasses] = useState<string[]>([])

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('ALL')
  const [selectedExam, setSelectedExam] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [previewCert, setPreviewCert] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  // Issue Certificate Form State
  const [selectedTypeId, setSelectedTypeId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [formStudentName, setFormStudentName] = useState('')
  const [formClassName, setFormClassName] = useState('')
  const [formSectionName, setFormSectionName] = useState('')
  const [formFatherName, setFormFatherName] = useState('')
  const [formRollNo, setFormRollNo] = useState('')
  const [formExam, setFormExam] = useState('Annual Examination 2025-26')
  const [formCertNo, setFormCertNo] = useState('')
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [formRemarks, setFormRemarks] = useState('For outstanding academic excellence and exemplary conduct.')
  const [formDesignId, setFormDesignId] = useState(1)
  const [formThemeColor, setFormThemeColor] = useState('#1E3A8A')
  const [formSchoolName, setFormSchoolName] = useState('COSMOPOLITAN INTER COLLEGE')
  const [formSchoolAddress, setFormSchoolAddress] = useState('Knowledge Park, Sector 62, New Delhi')
  const [formPrincipalName, setFormPrincipalName] = useState('Dr. S. K. Sharma')
  const [formPrincipalLabel, setFormPrincipalLabel] = useState('Principal & Director')
  const [formHiddenFields, setFormHiddenFields] = useState<string[]>([])
  const [formNarrativeTemplate, setFormNarrativeTemplate] = useState('')

  // Live Canvas Zoom Scale in Modal
  const [modalCanvasScale, setModalCanvasScale] = useState(0.52)
  const [modalViewTab, setModalViewTab] = useState<'split' | 'form' | 'preview'>('split')

  const printAreaRef = useRef<HTMLDivElement>(null)

  // Load data on mount
  useEffect(() => {
    loadData()
    const instClasses = loadInstituteAddedClasses()
    setAddedClasses(instClasses)
    if (instClasses.length > 0) {
      setFormClassName(instClasses[0])
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [certRes, typesRes, stdRes] = await Promise.all([
        fetchIssuedCertificates(),
        fetchCertificateTypes(),
        fetchStudentsForCertificate()
      ])

      if (certRes.success && certRes.data) {
        setCertificates(certRes.data)
      }

      if (typesRes.success && typesRes.data) {
        setCertTypes(typesRes.data)
        if (typesRes.data.length > 0 && !selectedTypeId) {
          applyCertificateType(typesRes.data[0], certRes.data || [])
        }
      }

      // Merge backend students with localStorage students
      let allStudents: any[] = stdRes.data || []
      const parseLocalStudents = (key: string) => {
        try {
          const saved = localStorage.getItem(key)
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.map((s: any, idx: number) => {
                const name = s.name || `${s.first_name || s.firstName || ''} ${s.last_name || s.lastName || ''}`.trim() || ''
                const rawClass = s.class || s.className || s.class_name || ''
                let cleanClass = rawClass
                let extractedSection = s.section || s.section_name || s.sectionName || ''

                if (rawClass.includes('(')) {
                  cleanClass = rawClass.split('(')[0].trim()
                  if (!extractedSection) {
                    const match = rawClass.match(/\(([^)]+)\)/)
                    if (match) extractedSection = match[1].trim()
                  }
                }

                return {
                  id: String(s.id || s.admission_no || s.admissionNo || `local-${key}-${idx}`),
                  name: name,
                  admissionNo: s.admission_no || s.admissionNo || '',
                  rollNo: s.roll_no || s.rollNo || s.admission_no || s.admissionNo || '',
                  className: cleanClass,
                  rawClass: rawClass,
                  section: extractedSection,
                  fatherName: s.fatherName || s.father_name || s.guardianName || s.father || ''
                }
              })
            }
          }
        } catch (e) {}
        return []
      }

      const local1 = parseLocalStudents('school_students')
      const local2 = parseLocalStudents('school_institute_students')
      const local3 = parseLocalStudents('students')
      allStudents = [...allStudents, ...local1, ...local2, ...local3]

      // Deduplicate students
      const seen = new Set()
      const uniqueStudents = allStudents.filter(s => {
        if (!s.name || s.name.trim().toLowerCase() === 'student') return false
        const key = `${s.admissionNo || s.id || ''}_${s.name.trim().toLowerCase()}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setStudents(uniqueStudents)


    } catch (err: any) {
      toast.error('Failed to load certificates: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper to configure form from a certificate type
  const applyCertificateType = (t: CertificateTypeData, currentCerts: any[] = certificates) => {
    if (!t) return
    setSelectedTypeId(t.id || '')
    const designNum = Number(t.designId) || 1
    setFormDesignId(designNum)
    setFormThemeColor(t.themeColor || t.titleBgColor || '#1E3A8A')
    setFormSchoolName(t.schoolName || 'COSMOPOLITAN INTER COLLEGE')
    setFormSchoolAddress(t.schoolAddress || 'Knowledge Park, Sector 62, New Delhi')
    setFormPrincipalName(t.principalName || 'Dr. S. K. Sharma')
    setFormPrincipalLabel(t.principalLabel || 'Principal & Director')
    setFormHiddenFields(t.hiddenFields || [])
    setFormNarrativeTemplate(t.content || '')

    // Auto next number
    const prefix = t.prefix || 'CER/2025/'
    const startSequence = parseInt(t.startNo || '101', 10) || 101
    const nextSeq = startSequence + currentCerts.length
    setFormCertNo(`${prefix}${nextSeq}`)

    // If type has specific classes, default class to first applicable class
    if (Array.isArray(t.classes) && t.classes.length > 0 && !t.classes.includes('All Classes')) {
      const matchCls = addedClasses.find(c => isClassMatch(c, t.classes[0]))
      if (matchCls) {
        setFormClassName(matchCls)
      } else if (t.classes[0]) {
        setFormClassName(t.classes[0])
      }
    }
  }

  // Handle Certificate Type selection change in create form
  const handleTypeChange = (typeId: string) => {
    const found = certTypes.find(t => String(t.id) === String(typeId))
    if (found) {
      applyCertificateType(found)
    }
  }

  // Handle Student selection change in create form - auto-fetches name, section, class, father name, roll no!
  const handleStudentChange = (stdId: string) => {
    setSelectedStudentId(stdId)
    if (!stdId) {
      setFormStudentName('')
      setFormSectionName('')
      setFormFatherName('')
      setFormRollNo('')
      return
    }
    const std = students.find(s => String(s.id) === String(stdId))
    if (std) {
      setFormStudentName(std.name || '')
      if (std.className) {
        const matchCls = addedClasses.find(c => isClassMatch(c, std.className))
        if (matchCls) setFormClassName(matchCls)
        else setFormClassName(std.className)
      }
      setFormSectionName(std.section || '')
      setFormFatherName(std.fatherName || '')
      setFormRollNo(std.rollNo || std.admissionNo || '')
    }
  }

  // Current selected Certificate Type object
  const currentTypeObj = useMemo(() => {
    return certTypes.find(t => String(t.id) === String(selectedTypeId)) || certTypes[0]
  }, [certTypes, selectedTypeId])

  // Filter students based on selected class (Only added students for this class)
  const filteredStudentsForModal = useMemo(() => {
    if (!formClassName) return students
    return students.filter(s => isClassMatch(s.className, formClassName))
  }, [students, formClassName])

  // Dynamic Content with Merge Tag Placeholders Replaced Live
  const dynamicLiveContent = useMemo(() => {
    let tmpl = formNarrativeTemplate || currentTypeObj?.content || formRemarks || 
      'This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement.'
    
    tmpl = tmpl.replace(/\{Student Name\}/gi, formStudentName || '[Student Name]')
    tmpl = tmpl.replace(/\{Father Name\}/gi, formFatherName || '[Guardian Name]')
    tmpl = tmpl.replace(/\{Class\}/gi, formClassName || '[Class]')
    tmpl = tmpl.replace(/\{Roll No\}/gi, formRollNo || '[Roll No]')
    tmpl = tmpl.replace(/\{Date\}/gi, formIssueDate || '[Date]')
    tmpl = tmpl.replace(/\{Exam\}/gi, formExam || '[Academic Examination]')
    tmpl = tmpl.replace(/\{Achievement Detail\}/gi, formRemarks || 'exemplary performance')
    tmpl = tmpl.replace(/\{Academic Session\}/gi, '2025-2026')
    tmpl = tmpl.replace(/\{Admission No\}/gi, formRollNo || '[Admission No]')
    return tmpl
  }, [formNarrativeTemplate, currentTypeObj, formRemarks, formStudentName, formFatherName, formClassName, formRollNo, formIssueDate, formExam])

  // Open Issue Modal - clean initial form state without fake students
  const handleOpenIssueModal = () => {
    if (certTypes.length > 0) {
      applyCertificateType(certTypes[0])
    }
    setSelectedStudentId('')
    setFormStudentName('')
    setFormSectionName('')
    setFormFatherName('')
    setFormRollNo('')
    setIsIssueModalOpen(true)
  }


  // Handle Submit New Certificate
  const handleIssueCertificate = async (e?: React.FormEvent, shouldPrint: boolean = false) => {
    if (e) e.preventDefault()
    if (!formStudentName.trim()) {
      toast.error('Please enter or select a student name')
      return
    }

    const title = currentTypeObj?.title || 'Certificate of Achievement'

    setIsSubmitting(true)
    try {
      const payload: IssuedCertificateData = {
        certificateTypeId: selectedTypeId || undefined,
        title: title,
        certificateNo: formCertNo || `CER/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        studentId: selectedStudentId || undefined,
        studentName: formStudentName.trim(),
        className: formClassName,
        sectionName: formSectionName,
        exam: formExam,
        issueDate: formIssueDate,
        designId: formDesignId,
        fatherName: formFatherName,
        rollNo: formRollNo,
        schoolName: formSchoolName,
        remarks: formRemarks,
        content: dynamicLiveContent,
        details: {
          designId: formDesignId,
          themeColor: formThemeColor,
          subtitle: currentTypeObj?.subtitle,
          schoolName: formSchoolName,
          schoolAddress: formSchoolAddress,
          principalName: formPrincipalName,
          principalLabel: formPrincipalLabel,
          hiddenFields: formHiddenFields,
          remarks: formRemarks,
          content: dynamicLiveContent
        }
      }

      const res = await saveIssuedCertificate(payload)
      if (res.success) {
        toast.success(`Certificate issued successfully for ${formStudentName}!`)
        setIsIssueModalOpen(false)
        await loadData()

        if (shouldPrint && res.data) {
          handlePrint(res.data)
        }
      } else {
        toast.error(res.error || 'Failed to save certificate')
      }
    } catch (err: any) {
      toast.error('Error saving certificate: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete Certificate
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete certificate for ${name}?`)) return
    setIsDeletingId(id)
    try {
      const res = await deleteIssuedCertificate(id)
      if (res.success) {
        toast.success('Certificate deleted successfully')
        setCertificates(prev => prev.filter(c => c.id !== id))
      } else {
        toast.error(res.error || 'Failed to delete certificate')
      }
    } catch (err: any) {
      toast.error('Error deleting: ' + err.message)
    } finally {
      setIsDeletingId(null)
    }
  }

  // Trigger Print
  const handlePrint = (cert: any) => {
    setPreviewCert(cert)
    setTimeout(() => {
      window.print()
    }, 400)
  }

  // Unique exams & classes for filters
  const uniqueExams = useMemo(() => {
    const set = new Set<string>()
    certificates.forEach(c => { if (c.exam) set.add(c.exam) })
    return Array.from(set)
  }, [certificates])

  const uniqueClasses = useMemo(() => {
    const set = new Set<string>(addedClasses)
    certificates.forEach(c => { if (c.class) set.add(c.class) })
    return Array.from(set)
  }, [certificates, addedClasses])

  // Filtered Certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter(c => {
      const q = searchQuery.toLowerCase()
      const matchQuery = 
        !q ||
        (c.student && c.student.toLowerCase().includes(q)) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.certificateNo && c.certificateNo.toLowerCase().includes(q)) ||
        (c.exam && c.exam.toLowerCase().includes(q))

      const matchClass = selectedClass === 'ALL' || c.class === selectedClass
      const matchExam = selectedExam === 'ALL' || c.exam === selectedExam
      const matchType = selectedType === 'ALL' || c.title === selectedType

      return matchQuery && matchClass && matchExam && matchType
    })
  }, [certificates, searchQuery, selectedClass, selectedExam, selectedType])

  // Render Certificate Template based on designId
  const renderCertificateTemplate = (cert: any) => {
    if (!cert) return null
    const design = Number(cert.designId) || 1
    const props = {
      title: cert.title?.toUpperCase() || 'CERTIFICATE OF ACHIEVEMENT',
      subtitle: cert.subtitle || (cert.exam ? `In Recognition of ${cert.exam}` : 'Academic Distinction & Excellence'),
      themeColor: cert.themeColor || cert.titleBgColor || '#1E3A8A',
      schoolName: cert.schoolName || 'COSMOPOLITAN INTER COLLEGE',
      schoolAddress: cert.schoolAddress || 'Knowledge Park, Sector 62, New Delhi - 110092',
      studentName: cert.student || cert.studentName || 'Student Name',
      className: `${cert.class || cert.className || 'Class 10'}${cert.section || cert.sectionName ? ` - ${cert.section || cert.sectionName}` : ''}`,
      content: cert.content || `This certificate is proudly conferred upon ${cert.student || 'the student'} in recognition of exemplary dedication, commendable academic merit, and outstanding achievement during the ${cert.exam || 'academic session'}.`,
      date: cert.date || cert.issueDate || new Date().toLocaleDateString('en-GB'),
      principalName: cert.principalName || 'Dr. S. K. Sharma',
      principalLabel: cert.principalLabel || 'Principal & Director',
      awarder: cert.principalLabel || 'Principal / Director',
      showQr: true,
      showSeal: true,
      hiddenFields: cert.hiddenFields || []
    }

    if (design === 2) return <CertificateDesign2 {...props} />
    if (design === 3) return <CertificateDesign3 {...props} />
    if (design === 4) return <CertificateDesign4 {...props} />
    return <CertificateDesign1 {...props} />
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-300">
      
      {/* Print-specific style */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate-area, #printable-certificate-area * {
            visibility: visible !important;
          }
          #printable-certificate-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Top Banner & Action */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <span>Generate Certificates</span>
              <span className="text-xs bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 rounded-full font-bold">
                {certificates.length} Issued
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Issue, preview, manage and print student achievement certificates with live customization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/institute/certificate/type"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Setup Certificate</span>
          </Link>

          <button
            onClick={handleOpenIssueModal}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Issue New Certificate</span>
          </button>
        </div>
      </div>

      {/* Main Content & Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        
        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, cert no, exam..." 
                className="pl-9 pr-4 py-2 w-full border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500"
            >
              <option value="ALL">All Classes ({uniqueClasses.length})</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Exam Filter */}
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500"
            >
              <option value="ALL">All Exams / Events</option>
              {uniqueExams.map(ex => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500"
            >
              <option value="ALL">All Certificate Types</option>
              {certTypes.map(t => (
                <option key={t.id} value={t.title}>{t.title}</option>
              ))}
            </select>

            {(selectedClass !== 'ALL' || selectedExam !== 'ALL' || selectedType !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedClass('ALL')
                  setSelectedExam('ALL')
                  setSelectedType('ALL')
                  setSearchQuery('')
                }}
                className="text-xs text-teal-600 hover:text-teal-700 font-bold px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-xs text-center whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5 text-left">S. No.</th>
                <th className="px-4 py-3.5 text-left">Certificate Title & No</th>
                <th className="px-4 py-3.5">Design & Theme</th>
                <th className="px-4 py-3.5 text-left">Student Name</th>
                <th className="px-4 py-3.5 text-left">Class & Section</th>
                <th className="px-4 py-3.5 text-left">Exam / Reason</th>
                <th className="px-4 py-3.5">Issue Date</th>
                <th className="px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                      <span>Loading issued certificates...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Award className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">No certificates found</span>
                      <p className="text-[11px] text-slate-400">Click &quot;Issue New Certificate&quot; to issue a certificate to a student.</p>
                      <button
                        onClick={handleOpenIssueModal}
                        className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold text-xs shadow-xs"
                      >
                        + Issue Student Certificate
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert, index) => (
                  <tr 
                    key={cert.id || index}
                    className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-left font-semibold text-slate-400">{index + 1}.</td>
                    
                    {/* Certificate Title & Serial */}
                    <td className="px-4 py-3.5 text-left">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{cert.title}</div>
                      <div className="font-mono text-[11px] text-teal-600 font-semibold">{cert.certificateNo}</div>
                    </td>

                    {/* Design & Theme Color Swatch */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                          style={{ backgroundColor: cert.themeColor || '#1E3A8A' }}
                        />
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          Design {cert.designId || 1}
                        </span>
                      </div>
                    </td>

                    {/* Student Name */}
                    <td className="px-4 py-3.5 text-left">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{cert.student || cert.studentName}</div>
                      {cert.fatherName && (
                        <div className="text-[10px] text-slate-400">S/o {cert.fatherName}</div>
                      )}
                    </td>

                    {/* Class & Section */}
                    <td className="px-4 py-3.5 text-left">
                      <span className="bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {cert.class || cert.className} {cert.section ? `(${cert.section})` : ''}
                      </span>
                    </td>

                    {/* Exam / Reason */}
                    <td className="px-4 py-3.5 text-left font-medium text-slate-600 dark:text-slate-300">
                      <div className="max-w-xs truncate" title={cert.exam}>
                        {cert.exam}
                      </div>
                    </td>

                    {/* Issue Date */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {cert.date || cert.issueDate}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPreviewCert(cert)}
                          className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300 flex items-center justify-center hover:bg-teal-100 transition-colors border border-teal-100 dark:border-teal-800"
                          title="Preview Certificate"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePrint(cert)}
                          className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center hover:bg-blue-100 transition-colors border border-blue-100 dark:border-blue-800"
                          title="Print Certificate"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cert.id, cert.student || cert.studentName)}
                          disabled={isDeletingId === cert.id}
                          className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-300 flex items-center justify-center hover:bg-red-100 transition-colors border border-red-100 dark:border-red-800 disabled:opacity-50"
                          title="Delete Certificate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs text-slate-500">
          <span>Showing {filteredCertificates.length} of {certificates.length} Issued Certificates</span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>PostgreSQL Synchronized & Active</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: ISSUE / CREATE CERTIFICATE FOR STUDENT (SPLIT VIEW)   */}
      {/* ============================================================== */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-7xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>Issue Student Certificate</span>
                    <span 
                      className="w-3 h-3 rounded-full border border-black/10 inline-block shadow-2xs"
                      style={{ backgroundColor: formThemeColor }}
                      title={`Theme: ${formThemeColor}`}
                    />
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Fill student details on the left, watch live certificate preview on the right, and save directly to database
                  </p>
                </div>
              </div>

              {/* View Mode Switcher & Close */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setModalViewTab('split')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      modalViewTab === 'split' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-2xs' : 'hover:text-slate-800'
                    }`}
                  >
                    Split View
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalViewTab('form')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      modalViewTab === 'form' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-2xs' : 'hover:text-slate-800'
                    }`}
                  >
                    Form Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalViewTab('preview')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      modalViewTab === 'preview' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-2xs' : 'hover:text-slate-800'
                    }`}
                  >
                    Full Preview
                  </button>
                </div>

                <button 
                  onClick={() => setIsIssueModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Split Screen */}
            <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
              
              {/* LEFT COLUMN: Issue Form */}
              {(modalViewTab === 'split' || modalViewTab === 'form') && (
                <div className={`${modalViewTab === 'split' ? 'w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800' : 'w-full'} p-6 md:p-8 flex flex-col gap-6 overflow-y-auto`}>
                  
                  {/* Certificate Type Selector */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                        1. Select Certificate Template Setup <span className="text-red-500">*</span>
                      </label>
                      <Link 
                        href="/institute/certificate/type/create"
                        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                      >
                        <span>+ Configure New Type</span>
                      </Link>
                    </div>

                    {certTypes.length === 0 ? (
                      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-1">
                          No Certificate Types Found
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 mb-2.5">
                          Please configure a certificate type first with your chosen certificate design and theme colors.
                        </p>
                        <Link
                          href="/institute/certificate/type/create"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Certificate Type</span>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <select
                          value={selectedTypeId}
                          onChange={(e) => handleTypeChange(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-xs"
                        >
                          {certTypes.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.title} (Design {t.designId || 1} • Serial: {t.prefix})
                            </option>
                          ))}
                        </select>

                        {currentTypeObj && (
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                            <span 
                              className="w-3 h-3 rounded-full border border-black/10 shrink-0" 
                              style={{ backgroundColor: formThemeColor }}
                            />
                            <span>Theme: <strong className="font-mono text-slate-700 dark:text-slate-300">{formThemeColor}</strong></span>
                            <span>•</span>
                            <span className="font-bold text-teal-700 dark:text-teal-400">Design {formDesignId}</span>
                            <span>•</span>
                            <span>Serial: <strong className="font-mono text-slate-700 dark:text-slate-300">{formCertNo}</strong></span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Student Details Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <UserCheck className="w-4 h-4 text-teal-600" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                        2. Recipient Student Selection
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Class Dropdown (Only Added Classes) */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Target Class / Standard <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formClassName}
                          onChange={(e) => {
                            const newClass = e.target.value
                            setFormClassName(newClass)
                            if (selectedStudentId) {
                              const currentStd = students.find(s => String(s.id) === String(selectedStudentId))
                              if (currentStd && currentStd.className && !isClassMatch(currentStd.className, newClass)) {
                                setSelectedStudentId('')
                                setFormStudentName('')
                                setFormSectionName('')
                                setFormFatherName('')
                                setFormRollNo('')
                              }
                            }
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-xs"
                        >
                          <option value="">-- Choose Class --</option>
                          {addedClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>

                      {/* Enrolled Student Dropdown (Only Added Students) */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Select Enrolled Student
                          </label>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {filteredStudentsForModal.length} student{filteredStudentsForModal.length === 1 ? '' : 's'} available
                          </span>
                        </div>
                        <select
                          value={selectedStudentId}
                          onChange={(e) => handleStudentChange(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 shadow-xs"
                        >
                          <option value="">-- Choose from Enrolled Students --</option>
                          {filteredStudentsForModal.length === 0 ? (
                            <option value="" disabled>
                              No enrolled students found {formClassName ? `in ${formClassName}` : ''}
                            </option>
                          ) : (
                            filteredStudentsForModal.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name} {s.section ? `• Sec: ${s.section}` : ''} {s.rollNo ? `• Roll: ${s.rollNo}` : (s.admissionNo ? `• Adm: ${s.admissionNo}` : '')}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Student Full Name - NOT EDITABLE ON SELECT OF STUDENT */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Student Full Name <span className="text-red-500">*</span>
                          </label>
                          {selectedStudentId && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Auto-captured (Locked)
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          disabled={!!selectedStudentId}
                          readOnly={!!selectedStudentId}
                          value={formStudentName}
                          onChange={(e) => setFormStudentName(e.target.value)}
                          placeholder={selectedStudentId ? "Auto-captured from student record" : "e.g. Select student above or enter name"}
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs font-bold outline-none shadow-xs transition-colors ${
                            selectedStudentId
                              ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed select-none'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:border-teal-500'
                          }`}
                        />
                      </div>

                      {/* Section - NOT EDITABLE ON SELECT OF STUDENT */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Section
                          </label>
                          {selectedStudentId && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Auto-captured (Locked)
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          disabled={!!selectedStudentId}
                          readOnly={!!selectedStudentId}
                          value={formSectionName}
                          onChange={(e) => setFormSectionName(e.target.value)}
                          placeholder={selectedStudentId ? "Auto-captured from student record" : "e.g. Section A"}
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none shadow-xs transition-colors ${
                            selectedStudentId
                              ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed select-none'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:border-teal-500'
                          }`}
                        />
                      </div>

                      {/* Father Name - NOT EDITABLE ON SELECT OF STUDENT */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Father / Guardian Name
                          </label>
                          {selectedStudentId && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Auto-captured (Locked)
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          disabled={!!selectedStudentId}
                          readOnly={!!selectedStudentId}
                          value={formFatherName}
                          onChange={(e) => setFormFatherName(e.target.value)}
                          placeholder={selectedStudentId ? (formFatherName || "Not specified in student record") : "e.g. Father or Guardian Name"}
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none shadow-xs transition-colors ${
                            selectedStudentId
                              ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed select-none'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:border-teal-500'
                          }`}
                        />
                      </div>

                      {/* Roll / Reg ID - NOT EDITABLE ON SELECT OF STUDENT */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Roll No / Reg ID
                          </label>
                          {selectedStudentId && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Auto-captured (Locked)
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          disabled={!!selectedStudentId}
                          readOnly={!!selectedStudentId}
                          value={formRollNo}
                          onChange={(e) => setFormRollNo(e.target.value)}
                          placeholder={selectedStudentId ? (formRollNo || "Auto-captured") : "e.g. Roll No or Admission No"}
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none shadow-xs transition-colors ${
                            selectedStudentId
                              ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed select-none'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:border-teal-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>



                  {/* Certificate & Event Details */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                        3. Certificate Serial & Event Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Exam / Reason */}
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Exam / Event / Honor Reason <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formExam}
                          onChange={(e) => setFormExam(e.target.value)}
                          placeholder="e.g. Annual Academic Examination 2025-26"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 shadow-xs"
                        />
                      </div>

                      {/* Certificate Number */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Certificate Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formCertNo}
                          onChange={(e) => setFormCertNo(e.target.value)}
                          placeholder="e.g. CER/2025/101"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-teal-600 outline-none focus:border-teal-500 shadow-xs"
                        />
                      </div>

                      {/* Issue Date */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Issue Date
                        </label>
                        <input
                          type="date"
                          value={formIssueDate}
                          onChange={(e) => setFormIssueDate(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 shadow-xs"
                        />
                      </div>

                      {/* Special Remarks */}
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Special Remarks / Citation Details
                        </label>
                        <textarea
                          rows={2}
                          value={formRemarks}
                          onChange={(e) => setFormRemarks(e.target.value)}
                          placeholder="Enter special honor notes..."
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 resize-none shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
                    <button
                      type="button"
                      onClick={() => setIsIssueModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleIssueCertificate(undefined, true)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Issue & Print</span>
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleIssueCertificate()}
                      className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Issuing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Issue & Save Certificate</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

              {/* RIGHT COLUMN: Live Interactive HD Certificate Preview */}
              {(modalViewTab === 'split' || modalViewTab === 'preview') && (
                <div className={`${modalViewTab === 'split' ? 'w-full lg:w-1/2' : 'w-full'} bg-slate-100 dark:bg-slate-950/80 p-6 flex flex-col justify-between overflow-hidden relative`}>
                  
                  {/* Canvas Header Bar */}
                  <div className="w-full flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span className="font-black text-slate-800 dark:text-slate-100">Live Certificate Preview</span>
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block"
                        style={{ backgroundColor: formThemeColor }}
                      />
                      <span className="text-[10px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold text-slate-600 border border-slate-200 dark:border-slate-700">
                        Design {formDesignId}
                      </span>
                    </div>

                    {/* Scale Zoom Controls */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setModalCanvasScale(prev => Math.max(0.38, prev - 0.06))}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-[10px] font-bold text-slate-600 px-1">
                        {Math.round(modalCanvasScale * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalCanvasScale(prev => Math.min(0.9, prev + 0.06))}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalCanvasScale(0.52)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Reset Zoom"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Centered Certificate Viewport */}
                  <div className="flex-1 w-full min-h-[460px] flex items-center justify-center overflow-hidden py-4">
                    <div 
                      style={{ transform: `scale(${modalCanvasScale})`, transformOrigin: 'center center' }}
                      className="transition-transform duration-200 shrink-0 shadow-2xl rounded-sm"
                    >
                      {formDesignId === 1 && (
                        <CertificateDesign1
                          title={currentTypeObj?.title || 'CERTIFICATE OF ACHIEVEMENT'}
                          subtitle={currentTypeObj?.subtitle || `In Recognition of ${formExam}`}
                          themeColor={formThemeColor}
                          schoolName={formSchoolName}
                          schoolAddress={formSchoolAddress}
                          studentName={formStudentName || 'Student Name'}
                          content={dynamicLiveContent}
                          date={formIssueDate}
                          principalName={formPrincipalName}
                          principalLabel={formPrincipalLabel}
                          hiddenFields={formHiddenFields}
                          editable={true}
                          onUpdateField={(field, val) => {
                            if (field === 'studentName') setFormStudentName(val)
                            else if (field === 'content') setFormNarrativeTemplate(val)
                            else if (field === 'principalName') setFormPrincipalName(val)
                            else if (field === 'date') setFormIssueDate(val)
                          }}
                        />
                      )}
                      {formDesignId === 2 && (
                        <CertificateDesign2
                          title={currentTypeObj?.title || 'CERTIFICATE OF MERIT'}
                          subtitle={currentTypeObj?.subtitle || `For High Scholarly Diligence`}
                          themeColor={formThemeColor}
                          schoolName={formSchoolName}
                          schoolAddress={formSchoolAddress}
                          studentName={formStudentName || 'Student Name'}
                          content={dynamicLiveContent}
                          date={formIssueDate}
                          principalName={formPrincipalName}
                          principalLabel={formPrincipalLabel}
                          hiddenFields={formHiddenFields}
                          editable={true}
                          onUpdateField={(field, val) => {
                            if (field === 'studentName') setFormStudentName(val)
                            else if (field === 'content') setFormNarrativeTemplate(val)
                            else if (field === 'principalName') setFormPrincipalName(val)
                            else if (field === 'date') setFormIssueDate(val)
                          }}
                        />
                      )}
                      {formDesignId === 3 && (
                        <CertificateDesign3
                          title={currentTypeObj?.title || 'CERTIFICATE OF EXCELLENCE'}
                          subtitle={currentTypeObj?.subtitle || `Honors in Extracurricular & Sports`}
                          themeColor={formThemeColor}
                          schoolName={formSchoolName}
                          schoolAddress={formSchoolAddress}
                          studentName={formStudentName || 'Student Name'}
                          content={dynamicLiveContent}
                          date={formIssueDate}
                          principalName={formPrincipalName}
                          principalLabel={formPrincipalLabel}
                          hiddenFields={formHiddenFields}
                          editable={true}
                          onUpdateField={(field, val) => {
                            if (field === 'studentName') setFormStudentName(val)
                            else if (field === 'content') setFormNarrativeTemplate(val)
                            else if (field === 'principalName') setFormPrincipalName(val)
                            else if (field === 'date') setFormIssueDate(val)
                          }}
                        />
                      )}
                      {formDesignId === 4 && (
                        <CertificateDesign4
                          title={currentTypeObj?.title || 'CERTIFICATE OF COMPLETION'}
                          subtitle={currentTypeObj?.subtitle || `Academic Curriculum & Co-Curricular`}
                          themeColor={formThemeColor}
                          schoolName={formSchoolName}
                          schoolAddress={formSchoolAddress}
                          studentName={formStudentName || 'Student Name'}
                          content={dynamicLiveContent}
                          date={formIssueDate}
                          principalName={formPrincipalName}
                          principalLabel={formPrincipalLabel}
                          hiddenFields={formHiddenFields}
                          editable={true}
                          onUpdateField={(field, val) => {
                            if (field === 'studentName') setFormStudentName(val)
                            else if (field === 'content') setFormNarrativeTemplate(val)
                            else if (field === 'principalName') setFormPrincipalName(val)
                            else if (field === 'date') setFormIssueDate(val)
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Footnote on Canvas */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-800">
                    <span>💡 Dynamic tags like &#123;Student Name&#125; are replaced live above.</span>
                    <span className="font-semibold text-teal-600">Printable A4 Landscape</span>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: HIGH-RES CERTIFICATE PREVIEW & PRINT                  */}
      {/* ============================================================== */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto py-8">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            {/* Modal Bar */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>{previewCert.title}</span>
                    <span 
                      className="w-3 h-3 rounded-full border border-black/10 inline-block shadow-2xs"
                      style={{ backgroundColor: previewCert.themeColor || '#1E3A8A' }}
                    />
                  </h3>
                  <div className="text-[11px] text-teal-600 font-mono font-semibold">
                    {previewCert.certificateNo || 'OFFICIAL RECORD'} • Issued for {previewCert.student || previewCert.studentName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(previewCert)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Certificate Display Container */}
            <div className="p-6 md:p-8 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-x-auto">
              <div id="printable-certificate-area" ref={printAreaRef} className="w-full max-w-[780px] shadow-2xl rounded-sm">
                {renderCertificateTemplate(previewCert)}
              </div>
            </div>

            {/* Modal Bottom Details */}
            <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span><strong>Issued To:</strong> {previewCert.student || previewCert.studentName}</span>
                <span>•</span>
                <span><strong>Class:</strong> {previewCert.class || previewCert.className}</span>
                <span>•</span>
                <span><strong>Date:</strong> {previewCert.date || previewCert.issueDate}</span>
              </div>
              <span className="text-[11px] text-teal-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified PostgreSQL Record
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { 
  Search, Filter, Eye, Trash2, X, Calendar, Plus, Award, 
  Printer, Download, ShieldCheck, CheckCircle2, ChevronRight,
  FileCheck, Sparkles, RefreshCw, GraduationCap, School, BookOpen
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
  CertificateDesign4 
} from '@/components/certificates/CertificateTemplates'

export default function AllCertificatePage() {
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<any[]>([])
  const [certTypes, setCertTypes] = useState<CertificateTypeData[]>([])
  const [students, setStudents] = useState<any[]>([])

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('ALL')
  const [selectedExam, setSelectedExam] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [previewCert, setPreviewCert] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  // Issue Certificate Form State
  const [selectedTypeId, setSelectedTypeId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [formStudentName, setFormStudentName] = useState('')
  const [formClassName, setFormClassName] = useState('Class 10')
  const [formSectionName, setFormSectionName] = useState('Section A')
  const [formFatherName, setFormFatherName] = useState('')
  const [formRollNo, setFormRollNo] = useState('')
  const [formExam, setFormExam] = useState('Annual Examination 2025-26')
  const [formCertNo, setFormCertNo] = useState('')
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [formRemarks, setFormRemarks] = useState('For outstanding academic excellence and exemplary conduct.')
  const [formDesignId, setFormDesignId] = useState(1)

  const printAreaRef = useRef<HTMLDivElement>(null)

  // Load data on mount
  useEffect(() => {
    loadData()
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
          const first = typesRes.data[0]
          setSelectedTypeId(first.id || '')
          setFormDesignId(first.designId || 1)
          setFormCertNo(`${first.prefix || 'CER/'}${first.startNo || '101'}`)
        }
      }
      if (stdRes.success && stdRes.data) {
        setStudents(stdRes.data)
      }
    } catch (err: any) {
      toast.error('Failed to load certificates: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Certificate Type selection change in create form
  const handleTypeChange = (typeId: string) => {
    setSelectedTypeId(typeId)
    const found = certTypes.find(t => t.id === typeId)
    if (found) {
      setFormDesignId(found.designId || 1)
      const nextNum = Math.floor(100 + certificates.length + 1)
      setFormCertNo(`${found.prefix || 'CER/'}${nextNum}`)
    }
  }

  // Handle Student selection change in create form
  const handleStudentChange = (stdId: string) => {
    setSelectedStudentId(stdId)
    const std = students.find(s => s.id === stdId)
    if (std) {
      setFormStudentName(std.name || '')
      setFormClassName(std.className || 'Class 10')
      setFormSectionName(std.section || 'Section A')
      setFormFatherName(std.fatherName || '')
      setFormRollNo(std.rollNo || std.admissionNo || '')
    }
  }

  // Handle Submit New Certificate
  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formStudentName.trim()) {
      toast.error('Please enter or select a student name')
      return
    }

    const typeObj = certTypes.find(t => t.id === selectedTypeId)
    const title = typeObj ? typeObj.title : 'Certificate of Achievement'

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
        schoolName: 'COSMOPOLITAN INTER COLLEGE',
        remarks: formRemarks,
        content: `This certificate is proudly awarded to ${formStudentName.trim()} for outstanding excellence, consistent dedication, and commendable achievement in ${formExam}.`
      }

      const res = await saveIssuedCertificate(payload)
      if (res.success) {
        toast.success(`Certificate issued successfully for ${formStudentName}!`)
        setIsIssueModalOpen(false)
        await loadData()
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
    const set = new Set<string>()
    certificates.forEach(c => { if (c.class) set.add(c.class) })
    return Array.from(set)
  }, [certificates])

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
      subtitle: cert.exam ? `In Recognition of ${cert.exam}` : 'Academic Distinction & Excellence',
      schoolName: cert.schoolName || 'COSMOPOLITAN INTER COLLEGE',
      schoolAddress: 'Knowledge Park, Sector 62, New Delhi - 110092',
      studentName: cert.student || 'Student Name',
      className: `${cert.class || 'Class 10'}${cert.section ? ` - ${cert.section}` : ''}`,
      content: cert.content || `This certificate is proudly conferred upon ${cert.student || 'the student'} in recognition of exemplary dedication, commendable academic merit, and outstanding achievement during the ${cert.exam || 'academic session'}.`,
      date: cert.date || new Date().toLocaleDateString('en-GB'),
      awarder: 'Principal / Director',
      showQr: true,
      showSeal: true
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
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">
            <School className="w-3.5 h-3.5" />
            <span>Institute Portal</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span>Academic Certificates</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Award className="w-7 h-7 text-teal-600" />
            Issued Certificates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official academic & extracurricular certificates generated and saved in PostgreSQL for your institute students.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/institute/certificate/type"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            Certificate Types
          </Link>

          <button
            onClick={() => {
              // Open modal and pre-fill default values
              if (students.length > 0) {
                handleStudentChange(students[0].id)
              }
              setIsIssueModalOpen(true)
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-black shadow-md shadow-teal-600/20 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Issue New Certificate
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Issued</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{certificates.length}</span>
            <span className="text-[10px] text-teal-600 font-bold">in PostgreSQL</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cert Types</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-600">{certTypes.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">available</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Students Filtered</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{filteredCertificates.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">shown</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Security</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xs font-black text-teal-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> QR Verified
            </span>
            <span className="text-[10px] text-slate-400 font-medium">CR80 Gold</span>
          </div>
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
              <option value="ALL">All Classes</option>
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
                <th className="px-4 py-3.5">Design</th>
                <th className="px-4 py-3.5 text-left">Student Name</th>
                <th className="px-4 py-3.5">Class & Sec</th>
                <th className="px-4 py-3.5 text-left">Exam / Occasion</th>
                <th className="px-4 py-3.5">Issue Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
                    Loading issued certificates from PostgreSQL...
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center mb-3">
                        <Award className="w-7 h-7" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Certificates Found</h3>
                      <p className="text-xs text-slate-400 mt-1 mb-4">
                        {searchQuery ? 'Try adjusting your search or filters.' : 'You have not issued any certificates yet.'}
                      </p>
                      <button
                        onClick={() => setIsIssueModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Issue First Certificate
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert, idx) => (
                  <tr key={cert.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 text-left text-slate-400 font-bold">{idx + 1}.</td>
                    
                    {/* Title & Certificate Number */}
                    <td className="px-4 py-3.5 text-left">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{cert.title}</div>
                      <div className="font-mono text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                        {cert.certificateNo || 'CER-UNASSIGNED'}
                      </div>
                    </td>

                    {/* Design Badge */}
                    <td className="px-4 py-3.5">
                      <div className="flex justify-center">
                        <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Design {cert.designId || 1}
                        </span>
                      </div>
                    </td>

                    {/* Student Name */}
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-black text-xs flex items-center justify-center">
                          {cert.student?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100">{cert.student}</div>
                          {cert.fatherName && (
                            <div className="text-[10px] text-slate-400">S/o {cert.fatherName}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Class & Section */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {cert.class} {cert.section ? `(${cert.section})` : ''}
                      </span>
                    </td>

                    {/* Exam / Occasion */}
                    <td className="px-4 py-3.5 text-left text-slate-600 dark:text-slate-300 font-medium">
                      {cert.exam || 'Academic Recognition'}
                    </td>

                    {/* Issue Date & Time */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="text-slate-700 dark:text-slate-300 font-semibold">{cert.date}</div>
                      <div className="text-[10px] text-slate-400">{cert.time}</div>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview */}
                        <button 
                          onClick={() => setPreviewCert(cert)}
                          title="View High-Res Certificate"
                          className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 hover:bg-teal-100 border border-teal-200/60 flex items-center justify-center transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Print */}
                        <button 
                          onClick={() => handlePrint(cert)}
                          title="Print / Save PDF"
                          className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 hover:bg-blue-100 border border-blue-200/60 flex items-center justify-center transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button 
                          onClick={() => handleDelete(cert.id, cert.student)}
                          disabled={isDeletingId === cert.id}
                          title="Delete from PostgreSQL"
                          className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-500 hover:bg-red-100 border border-red-200/60 flex items-center justify-center transition-all disabled:opacity-50"
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
      {/* MODAL 1: ISSUE / CREATE CERTIFICATE FOR STUDENT                */}
      {/* ============================================================== */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto py-10">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                    Issue Student Certificate
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Generate an official institutional certificate and save to PostgreSQL
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsIssueModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleIssueCertificate} className="p-8 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. Certificate Type Selection */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Select Certificate Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTypeId}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  >
                    {certTypes.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.title} (Design {t.designId} • Prefix: {t.prefix})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Pick Student or Custom */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Select Enrolled Student
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  >
                    <option value="">-- Choose from Enrolled Students --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.className || 'Class 10'} • Reg: {s.admissionNo})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Student Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formStudentName}
                    onChange={(e) => setFormStudentName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                {/* 4. Class Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Class / Standard
                  </label>
                  <input
                    type="text"
                    value={formClassName}
                    onChange={(e) => setFormClassName(e.target.value)}
                    placeholder="e.g. Class 10"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                {/* 5. Section */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Section
                  </label>
                  <input
                    type="text"
                    value={formSectionName}
                    onChange={(e) => setFormSectionName(e.target.value)}
                    placeholder="e.g. Section A"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                {/* 6. Father's / Guardian Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Father / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formFatherName}
                    onChange={(e) => setFormFatherName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                {/* 7. Roll / Reg No */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Roll No / Reg ID
                  </label>
                  <input
                    type="text"
                    value={formRollNo}
                    onChange={(e) => setFormRollNo(e.target.value)}
                    placeholder="e.g. 1001"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                {/* 8. Exam / Reason */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Exam / Event / Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formExam}
                    onChange={(e) => setFormExam(e.target.value)}
                    placeholder="e.g. Annual Academic Exam, Science Olympiad"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                {/* 9. Certificate Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Certificate Number
                  </label>
                  <input
                    type="text"
                    value={formCertNo}
                    onChange={(e) => setFormCertNo(e.target.value)}
                    placeholder="e.g. CER/ACH/105"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-teal-600 dark:text-teal-400 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                {/* 10. Issue Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                {/* 11. Design Template Choice */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Template Design
                  </label>
                  <select
                    value={formDesignId}
                    onChange={(e) => setFormDesignId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  >
                    <option value={1}>Design 1 - Royal Gold & Navy Geometric</option>
                    <option value={2}>Design 2 - Emerald Prestige Honors</option>
                    <option value={3}>Design 3 - Burgundy Classic Executive</option>
                    <option value={4}>Design 4 - Modern Charcoal Minimalist</option>
                  </select>
                </div>

                {/* 12. Remarks / Honor Note */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Special Remarks / Honor Citation
                  </label>
                  <textarea
                    rows={2}
                    value={formRemarks}
                    onChange={(e) => setFormRemarks(e.target.value)}
                    placeholder="Enter custom commendation remarks..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to PostgreSQL...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Issue & Save Certificate
                    </>
                  )}
                </button>
              </div>
            </form>
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
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {previewCert.title}
                  </h3>
                  <div className="text-[11px] text-teal-600 font-mono font-semibold">
                    {previewCert.certificateNo || 'OFFICIAL PASS'} • Issued for {previewCert.student}
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
                <span><strong>Issued To:</strong> {previewCert.student}</span>
                <span>•</span>
                <span><strong>Class:</strong> {previewCert.class}</span>
                <span>•</span>
                <span><strong>Date:</strong> {previewCert.date}</span>
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

'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, Plus, Pencil, Trash2, X, AlertTriangle, Eye, Printer,
  Sparkles, RefreshCw, BookOpen, Layers, Check, CheckCircle2, ShieldCheck,
  FileText, LayoutTemplate, School, Calendar, ChevronRight, FileCheck,
  QrCode, Clock, ArrowRight, ToggleLeft, ToggleRight, CheckSquare, LayoutGrid, List
} from 'lucide-react'
import { toast } from 'sonner'
import {
  fetchMarksheetSetups,
  saveMarksheetSetup,
  deleteMarksheetSetup,
  fetchExamGroups,
  saveExamGroup,
  ExamMarksheetSetupRecord
} from '@/app/institute/exam-marksheet/setup/actions'
import { MarksheetPreview } from '@/components/marksheets/MarksheetPreview'
import { AdmitCardModalPreview } from '@/components/admit-card/AdmitCardModalPreview'
import { getInstituteAddedClasses, MasterClassWithSections } from '@/lib/institute-classes'
import {
  AdmitCardConfig,
  TimeTableEntry,
  getStoredAdmitCards,
  saveStoredAdmitCards,
  getStoredTimetables,
  generateAdmitCardAndTimetableForSetup,
  syncAllSetupsWithAdmitCards
} from '@/lib/admit-card-sync'

interface UnifiedExamAdmitHubProps {
  defaultTab?: 'marksheet' | 'admit-card'
}

export default function UnifiedExamAdmitHub({ defaultTab = 'marksheet' }: UnifiedExamAdmitHubProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  // Active Tab: 'marksheet' or 'admit-card'
  const [activeTab, setActiveTab] = useState<'marksheet' | 'admit-card'>(
    tabParam === 'admit-card' ? 'admit-card' : defaultTab
  )

  // View Mode for Marksheet Setups (Card View frame is first visible by default)
  const [marksheetViewMode, setMarksheetViewMode] = useState<'cards' | 'table'>('cards')

  const [loading, setLoading] = useState(true)
  const [setups, setSetups] = useState<ExamMarksheetSetupRecord[]>([])
  const [admitCards, setAdmitCards] = useState<AdmitCardConfig[]>([])
  const [timetables, setTimetables] = useState<TimeTableEntry[]>([])

  // Search & Filter state for Marksheets
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('ALL')
  const [selectedClass, setSelectedClass] = useState('ALL')
  const [selectedTemplate, setSelectedTemplate] = useState('ALL')
  const [selectedSession, setSelectedSession] = useState('2025-2026')

  // Search & Filter state for Admit Cards
  const [admitSearchQuery, setAdmitSearchQuery] = useState('')
  const [admitFilterClass, setAdmitFilterClass] = useState('')
  const [admitSelectedSession, setAdmitSelectedSession] = useState('2025-2026')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSetup, setEditingSetup] = useState<ExamMarksheetSetupRecord | null>(null)
  const [previewSetup, setPreviewSetup] = useState<ExamMarksheetSetupRecord | null>(null)
  const [previewCard, setPreviewCard] = useState<AdmitCardConfig | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  // Master added classes & sections
  const [masterClasses, setMasterClasses] = useState<MasterClassWithSections[]>([])

  // Form fields for Quick Add / Edit Modal
  const [formGroup, setFormGroup] = useState('Exam')
  const [formExam, setFormExam] = useState('')
  const [formClassGrade, setFormClassGrade] = useState('')
  const [formSections, setFormSections] = useState<string[]>([])
  const [formMarksGrade, setFormMarksGrade] = useState('Percentage')
  const [formTemplateName, setFormTemplateName] = useState('Purple Classic')
  const [formSession, setFormSession] = useState('2025-2026')
  const [formExamDate, setFormExamDate] = useState(new Date().toISOString().split('T')[0])
  const [autoGenerateAdmitCard, setAutoGenerateAdmitCard] = useState(true)
  const [formAdmitCardLabel, setFormAdmitCardLabel] = useState('Admit Card')

  // Create Group Popup State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [isSavingGroup, setIsSavingGroup] = useState(false)
  const [availableGroups, setAvailableGroups] = useState<string[]>([])

  const printAreaRef = useRef<HTMLDivElement>(null)

  // Initialize and load data
  useEffect(() => {
    loadAllData()
  }, [])

  // Sync tab with URL parameter if present
  useEffect(() => {
    if (tabParam === 'admit-card' || tabParam === 'marksheet') {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const loadAllData = async () => {
    setLoading(true)
    const addedClasses = getInstituteAddedClasses()
    setMasterClasses(addedClasses)
    if (addedClasses.length > 0) {
      setFormClassGrade(addedClasses[0].className)
      setFormSections([...addedClasses[0].sections])
    }

    await loadGroups()
    const loadedSetups = await loadSetups()

    // Load Admit Cards & Timetables from local storage
    const storedCards = getStoredAdmitCards()
    setAdmitCards(storedCards)
    setTimetables(getStoredTimetables())

    // Auto-sync if there are setups without admit cards
    if (loadedSetups && loadedSetups.length > 0) {
      const { createdCount, admitCards: syncedCards } = syncAllSetupsWithAdmitCards(loadedSetups)
      if (createdCount > 0) {
        setAdmitCards(syncedCards)
      }
    }

    setLoading(false)
  }

  const loadGroups = async () => {
    try {
      const res = await fetchExamGroups()
      if (res.success && res.data) {
        setAvailableGroups(res.data.map((g: any) => g.groupName))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadSetups = async (): Promise<ExamMarksheetSetupRecord[]> => {
    try {
      const res = await fetchMarksheetSetups()
      if (res.success && res.data) {
        setSetups(res.data)
        return res.data
      } else {
        toast.error(res.error || 'Failed to load setups')
        return []
      }
    } catch (err: any) {
      toast.error('Error fetching marksheet setups: ' + err.message)
      return []
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name')
      return
    }

    setIsSavingGroup(true)
    try {
      const res = await saveExamGroup(newGroupName, newGroupDesc)
      if (res.success && res.data) {
        toast.success(`Exam group "${newGroupName.trim()}" created successfully!`)
        setAvailableGroups(prev => Array.from(new Set([...prev, res.data.groupName])))
        setFormGroup(res.data.groupName)
        setNewGroupName('')
        setNewGroupDesc('')
        setIsGroupModalOpen(false)
      } else {
        toast.error(res.error || 'Failed to create group')
      }
    } catch (err: any) {
      toast.error('Error creating group: ' + err.message)
    } finally {
      setIsSavingGroup(false)
    }
  }

  const handleOpenAdd = () => {
    const firstCls = masterClasses[0]?.className || 'Class 10'
    const firstSecs = masterClasses[0]?.sections || ['Section A']
    setEditingSetup(null)
    setFormGroup(availableGroups[0] || 'Exam')
    setFormExam('')
    setFormClassGrade(firstCls)
    setFormSections([...firstSecs])
    setFormMarksGrade('Percentage')
    setFormTemplateName('Purple Classic')
    setFormSession('2025-2026')
    setFormExamDate(new Date().toISOString().split('T')[0])
    setAutoGenerateAdmitCard(true)
    setFormAdmitCardLabel('Admit Card')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (setup: ExamMarksheetSetupRecord) => {
    setEditingSetup(setup)
    setFormGroup(setup.group || 'Exam')
    setFormExam(setup.exam || '')
    const baseClassName = setup.config?.className || setup.classGrade?.split('(')[0]?.trim() || setup.classGrade || ''
    setFormClassGrade(baseClassName)

    let existingSecs: string[] = []
    if (Array.isArray(setup.config?.sections) && setup.config.sections.length > 0) {
      existingSecs = setup.config.sections
    } else {
      const foundCls = masterClasses.find(m => m.className === baseClassName)
      existingSecs = foundCls ? [...foundCls.sections] : ['Section A']
    }
    setFormSections(existingSecs)
    setFormMarksGrade(setup.marksGrade || 'Percentage')
    setFormTemplateName(setup.templateName || 'Purple Classic')
    setFormSession(setup.session || '2025-2026')
    setFormExamDate(setup.examDate || new Date().toISOString().split('T')[0])
    setAutoGenerateAdmitCard(true)
    setFormAdmitCardLabel('Admit Card')
    setIsModalOpen(true)
  }

  const handleModalClassChange = (newClassName: string) => {
    setFormClassGrade(newClassName)
    const found = masterClasses.find(m => m.className === newClassName)
    if (found) {
      setFormSections([...found.sections])
    }
  }

  const handleToggleModalSection = (sec: string) => {
    setFormSections(prev =>
      prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]
    )
  }

  const handleSelectAllModalSections = (allSecs: string[]) => {
    setFormSections(prev =>
      prev.length === allSecs.length ? [] : [...allSecs]
    )
  }

  const handleDelete = async (id: string, examName: string) => {
    if (!confirm(`Are you sure you want to delete the setup for "${examName}"?`)) return
    setIsDeletingId(id)
    try {
      const res = await deleteMarksheetSetup(id)
      if (res.success) {
        toast.success('Setup deleted successfully')
        setSetups(prev => prev.filter(s => s.id !== id))
      } else {
        toast.error(res.error || 'Failed to delete setup')
      }
    } catch (err: any) {
      toast.error('Error deleting setup: ' + err.message)
    } finally {
      setIsDeletingId(null)
    }
  }

  const handleDeleteAdmitCard = (id: number) => {
    if (confirm('Are you sure you want to delete this Admit Card template?')) {
      const updated = admitCards.filter(c => c.id !== id)
      setAdmitCards(updated)
      saveStoredAdmitCards(updated)
      toast.success('Admit Card deleted successfully')
    }
  }

  const handleSyncAllAdmitCards = () => {
    const { createdCount, admitCards: synced } = syncAllSetupsWithAdmitCards(setups)
    setAdmitCards(synced)
    setTimetables(getStoredTimetables())
    if (createdCount > 0) {
      toast.success(`⚡ Synchronized ${createdCount} new Admit Card(s) and Time Table(s) from Exam Setups!`)
    } else {
      toast.info('All Exam Setups already have synchronized Admit Cards ready.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formExam.trim() || !formClassGrade.trim()) {
      toast.error('Please fill in Exam Name and Class.')
      return
    }
    if (formSections.length === 0) {
      toast.error('Please select at least one section for this class.')
      return
    }

    setIsSubmitting(true)
    try {
      const defaultSubjects = editingSetup?.config?.subjects || [
        { id: 1, subjectName: 'English Core', maxMarks: '100', practicalColumn: true, practicalMarks: '20' },
        { id: 2, subjectName: 'Mathematics', maxMarks: '100', practicalColumn: false, practicalMarks: '' },
        { id: 3, subjectName: 'General Science', maxMarks: '100', practicalColumn: true, practicalMarks: '30' },
        { id: 4, subjectName: 'Social Science', maxMarks: '100', practicalColumn: false, practicalMarks: '' },
        { id: 5, subjectName: 'Hindi / Regional', maxMarks: '100', practicalColumn: false, practicalMarks: '' }
      ]

      const formattedClassGrade = formSections.length > 0
        ? `${formClassGrade} (${formSections.map(s => s.replace('Section ', 'Sec ')).join(', ')})`
        : formClassGrade

      const configData = {
        ...(editingSetup?.config || {}),
        className: formClassGrade,
        sections: formSections,
        subjects: defaultSubjects,
        templateName: formTemplateName,
        schoolDetails: editingSetup?.config?.schoolDetails || {
          schoolName: 'COSMOPOLITAN INTER COLLEGE',
          affiliateTo: 'CBSE Affiliated, New Delhi',
          schoolAddress: 'Knowledge Park, Sector 62, New Delhi - 110092',
          schoolCode: '123456',
          phone: '+91 11 2345 6789',
          principalName: 'Dr. Meenakshi Sundaram',
          academicYear: formSession
        }
      }

      const res = await saveMarksheetSetup({
        id: editingSetup ? editingSetup.id : undefined,
        groupName: formGroup,
        examName: formExam.trim(),
        classGrade: formattedClassGrade,
        marksGrade: formMarksGrade,
        templateName: formTemplateName,
        session: formSession,
        examDate: formExamDate,
        config: configData
      })

      if (res.success) {
        // Simultaneously generate Admit Card & Timetable if requested
        if (autoGenerateAdmitCard) {
          generateAdmitCardAndTimetableForSetup({
            id: res.data?.id || editingSetup?.id,
            exam: formExam.trim(),
            classGrade: formattedClassGrade,
            session: formSession,
            examDate: formExamDate,
            config: configData
          })
          setAdmitCards(getStoredAdmitCards())
          setTimetables(getStoredTimetables())
          toast.success(
            editingSetup
              ? 'Exam Setup & Admit Card updated simultaneously!'
              : 'Exam Setup & Admit Card created simultaneously!'
          )
        } else {
          toast.success(editingSetup ? 'Setup updated!' : 'New setup created!')
        }

        setIsModalOpen(false)
        await loadSetups()
      } else {
        toast.error(res.error || 'Failed to save setup')
      }
    } catch (err: any) {
      toast.error('Error saving: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Find linked admit card for a marksheet setup
  const getLinkedAdmitCard = (setup: ExamMarksheetSetupRecord): AdmitCardConfig | undefined => {
    const baseClassName =
      setup.config?.className || (setup.classGrade ? setup.classGrade.split('(')[0].trim() : '')
    return admitCards.find(
      c =>
        (setup.id && c.setupId === setup.id) ||
        (c.examName.toLowerCase() === setup.exam.toLowerCase() && c.className === baseClassName)
    )
  }

  const handleOpenAdmitCardForSetup = (setup: ExamMarksheetSetupRecord) => {
    let card = getLinkedAdmitCard(setup)
    if (!card) {
      const generated = generateAdmitCardAndTimetableForSetup(setup)
      setAdmitCards(getStoredAdmitCards())
      setTimetables(getStoredTimetables())
      card = generated.admitCard
      toast.success(`Generated Admit Card for ${setup.exam} (${setup.classGrade})!`)
    }
    setPreviewCard(card)
  }

  // Print Marksheet
  const handlePrintMarksheet = () => {
    setTimeout(() => {
      window.print()
    }, 300)
  }

  // Derived filter options for Marksheets
  const uniqueGroups = useMemo(() => {
    const set = new Set<string>()
    setups.forEach(s => { if (s.group) set.add(s.group) })
    return Array.from(set)
  }, [setups])

  const uniqueClasses = useMemo(() => {
    const set = new Set<string>()
    masterClasses.forEach(m => set.add(m.className))
    setups.forEach(s => {
      if (s.config?.className) set.add(s.config.className)
      else if (s.classGrade) {
        const baseName = s.classGrade.split('(')[0]?.trim()
        if (baseName) set.add(baseName)
      }
    })
    return Array.from(set)
  }, [setups, masterClasses])

  const uniqueTemplates = useMemo(() => {
    const set = new Set<string>()
    setups.forEach(s => { if (s.templateName) set.add(s.templateName) })
    return Array.from(set)
  }, [setups])

  // Filtered Marksheets
  const filteredSetups = useMemo(() => {
    return setups.filter(item => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        (item.exam && item.exam.toLowerCase().includes(q)) ||
        (item.classGrade && item.classGrade.toLowerCase().includes(q)) ||
        (item.group && item.group.toLowerCase().includes(q)) ||
        (item.templateName && item.templateName.toLowerCase().includes(q))

      const matchesGroup = selectedGroup === 'ALL' || item.group === selectedGroup
      const matchesClass =
        selectedClass === 'ALL' ||
        item.classGrade === selectedClass ||
        item.classGrade?.startsWith(selectedClass) ||
        item.config?.className === selectedClass
      const matchesTemplate = selectedTemplate === 'ALL' || item.templateName === selectedTemplate
      const matchesSession = !selectedSession || item.session === selectedSession

      return matchesSearch && matchesGroup && matchesClass && matchesTemplate && matchesSession
    })
  }, [setups, searchQuery, selectedGroup, selectedClass, selectedTemplate, selectedSession])

  // Filtered Admit Cards
  const filteredAdmitCards = useMemo(() => {
    return admitCards.filter(c => {
      const q = admitSearchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        c.className.toLowerCase().includes(q) ||
        c.examName.toLowerCase().includes(q)
      const matchesClass = admitFilterClass ? c.className === admitFilterClass : true
      const matchesSession = admitSelectedSession ? c.session === admitSelectedSession : true
      return matchesSearch && matchesClass && matchesSession
    })
  }, [admitCards, admitSearchQuery, admitFilterClass, admitSelectedSession])

  // Template Badge style helper
  const getTemplateBadge = (templateName: string) => {
    const t = templateName?.toLowerCase() || ''
    if (t.includes('maroon') || t.includes('scholastic')) {
      return {
        bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
        dot: 'bg-red-600'
      }
    }
    if (t.includes('indigo') || t.includes('skills')) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
        dot: 'bg-blue-600'
      }
    }
    if (t.includes('navy')) {
      return {
        bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200',
        dot: 'bg-slate-700'
      }
    }
    return {
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-600'
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-300">
      
      {/* Print-specific style for Marksheet preview */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-marksheet-area, #printable-marksheet-area * {
            visibility: visible !important;
          }
          #printable-marksheet-area {
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
            <span>Examination & Hall Tickets</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-teal-600" />
            Exam Marksheet & Admit Card Setup
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            2-in-1 real-time synchronized management for examinations, marksheets, and admit cards • Customize content according to your institute requirements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncAllAdmitCards}
            className="px-4 py-2.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            title="Ensure every Exam Setup has an Admit Card generated"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            ⚡ Simultaneous Sync
          </button>
        </div>
      </div>

      {/* Synchronized Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam Marksheets</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{setups.length}</span>
            <span className="text-[10px] text-teal-600 font-bold">in PostgreSQL</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admit Cards Ready</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{admitCards.length}</span>
            <span className="text-[10px] text-emerald-600 font-bold">synchronized</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Classes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-600">{uniqueClasses.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">master classes</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam Timetables</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-purple-600">{timetables.length}</span>
            <span className="text-[10px] text-purple-600 font-medium">schedules active</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* UNIFIED TAB NAVIGATION (SIMULTANEOUS WORKSPACE)                 */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('marksheet')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'marksheet'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Exam & Marksheet Setup</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'marksheet'
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
            }`}>
              {setups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('admit-card')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'admit-card'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>2. Admit Cards & Timetables</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'admit-card'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
            }`}>
              {admitCards.length}
            </span>
          </button>
        </div>

        {/* Simultaneous Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl w-fit">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700 dark:text-emerald-300">Simultaneous Mode: Marksheets & Admit Cards work in real-time sync</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: EXAM & MARKSHEET SETUP TABLE (WITH ADMIT CARD ACTIONS)   */}
      {/* ============================================================== */}
      {activeTab === 'marksheet' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm animate-in fade-in duration-200">
          
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search exam, class, group..."
                  className="pl-9 pr-4 py-2 w-full border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Group Filter */}
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500"
              >
                <option value="ALL">All Groups</option>
                {uniqueGroups.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              {/* Class Filter */}
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500"
              >
                <option value="ALL">All Classes</option>
                {uniqueClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Template Filter */}
              <select
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500"
              >
                <option value="ALL">All Templates</option>
                {uniqueTemplates.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {(selectedGroup !== 'ALL' || selectedClass !== 'ALL' || selectedTemplate !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedGroup('ALL')
                    setSelectedClass('ALL')
                    setSelectedTemplate('ALL')
                    setSearchQuery('')
                  }}
                  className="text-xs text-teal-600 hover:text-teal-700 font-bold px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* View Switcher: Card View (Default / First Visible) vs Table View */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <button
                  onClick={() => setMarksheetViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    marksheetViewMode === 'cards'
                      ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Card View</span>
                </button>
                <button
                  onClick={() => setMarksheetViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    marksheetViewMode === 'table'
                      ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Table View</span>
                </button>
              </div>

              <button
                onClick={loadAllData}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Refresh All"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* ─── CARD VIEW (FRAME PREVIEW FIRST VISIBLE) ─── */}
          {marksheetViewMode === 'cards' && (
            <div className="animate-in fade-in duration-300">
              {loading ? (
                <div className="py-16 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                  Loading marksheet frames & setups...
                </div>
              ) : filteredSetups.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8">
                  <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No marksheet setups found matching criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSetups.map((item) => {
                    const badge = getTemplateBadge(item.templateName)
                    const linkedCard = getLinkedAdmitCard(item)

                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                      >
                        {/* Card Top Info */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-start justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {item.group}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                {item.classGrade}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                {item.templateName}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate" title={item.exam}>
                              {item.exam}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Session: {item.session} • Grade: {item.marksGrade}
                            </p>
                          </div>

                          {/* Quick Preview Eye */}
                          <button
                            onClick={() => setPreviewSetup(item)}
                            title="Preview Marksheet"
                            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-teal-600 hover:border-teal-500 transition-colors flex items-center justify-center shrink-0 shadow-xs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Card Frame Preview Area */}
                        <div className="relative bg-slate-100/70 dark:bg-slate-900/80 p-3 h-[340px] flex items-center justify-center overflow-hidden">
                          <div 
                            className="transition-transform duration-300 group-hover:scale-[0.43] pointer-events-none select-none drop-shadow-md origin-top shrink-0"
                            style={{
                              transform: 'scale(0.39)',
                              width: '780px',
                              marginTop: '-25px'
                            }}
                          >
                            <MarksheetPreview 
                              templateName={item.templateName}
                              examName={item.exam}
                              className={item.classGrade}
                              academicYear={item.session}
                            />
                          </div>

                          {/* Hover Overlay Button to open Preview / Edit */}
                          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto gap-2">
                            <button
                              onClick={() => setPreviewSetup(item)}
                              className="px-3 py-1.5 rounded-xl bg-white text-slate-800 font-bold text-xs shadow-lg hover:bg-slate-50 transition-all flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-teal-600" />
                              Preview Marksheet
                            </button>
                            {linkedCard && (
                              <button
                                onClick={() => setPreviewCard(linkedCard)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-1.5"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                Admit Card
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-lg hover:bg-teal-700 transition-all flex items-center gap-1.5"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit Content
                            </button>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 flex items-center justify-between text-xs">
                          {linkedCard ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Admit Card Ready
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {item.date}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPreviewSetup(item)}
                              title="Preview Marksheet"
                              className="w-7 h-7 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center border border-purple-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {linkedCard && (
                              <button
                                onClick={() => setPreviewCard(linkedCard)}
                                title="Preview Admit Card"
                                className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center border border-emerald-100 transition-colors"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Content"
                              className="px-2.5 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100 transition-colors font-bold text-xs flex items-center gap-1"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit Content</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── TABLE VIEW ─── */}
          {marksheetViewMode === 'table' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in duration-300">
              <table className="w-full text-xs text-center whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5 text-left">S. No.</th>
                    <th className="px-4 py-3.5 text-left">Group</th>
                    <th className="px-4 py-3.5 text-left">Exam Name</th>
                    <th className="px-4 py-3.5">Class Grade</th>
                    <th className="px-4 py-3.5">Marks Grade</th>
                    <th className="px-4 py-3.5 text-left">Template Layout</th>
                    <th className="px-4 py-3.5">Admit Card & Schedule</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
                        Loading exam setups & admit cards...
                      </td>
                    </tr>
                  ) : filteredSetups.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400">
                        No Marksheet Setups Found.
                      </td>
                    </tr>
                  ) : (
                    filteredSetups.map((item, i) => {
                      const badge = getTemplateBadge(item.templateName)
                      const linkedCard = getLinkedAdmitCard(item)

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 text-left text-slate-400 font-bold">{i + 1}.</td>

                          {/* Group */}
                          <td className="px-4 py-3.5 text-left">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {item.group}
                            </span>
                          </td>

                          {/* Exam Name */}
                          <td className="px-4 py-3.5 text-left font-bold text-slate-800 dark:text-slate-100">
                            {item.exam}
                            <div className="text-[10px] text-slate-400 font-normal">Session: {item.session || '2025-2026'}</div>
                          </td>

                          {/* Class Grade */}
                          <td className="px-4 py-3.5">
                            <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                              {item.classGrade}
                            </span>
                          </td>

                          {/* Marks Grade */}
                          <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-300">
                            {item.marksGrade}
                          </td>

                          {/* Template Layout */}
                          <td className="px-4 py-3.5 text-left">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold border ${badge.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                              <span>{item.templateName}</span>
                            </div>
                          </td>

                          {/* Simultaneous Admit Card Badge / Action */}
                          <td className="px-4 py-3.5">
                            {linkedCard ? (
                              <button
                                onClick={() => setPreviewCard(linkedCard)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all shadow-2xs"
                                title="Click to View & Print Admit Card"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Admit Card Ready</span>
                                <Eye className="w-3 h-3 text-emerald-600 ml-0.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenAdmitCardForSetup(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-all"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>Generate Admit Card</span>
                              </button>
                            )}
                          </td>

                          {/* Actions: Preview Marksheet, Preview Admit Card, Edit Content */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setPreviewSetup(item)}
                                title="Preview Marksheet Design"
                                className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 hover:bg-purple-100 border border-purple-200/60 flex items-center justify-center transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenAdmitCardForSetup(item)}
                                title="Preview & Print Admit Card"
                                className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/60 flex items-center justify-center transition-all"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenEdit(item)}
                                title="Edit Setup Content"
                                className="px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border border-teal-200/60 flex items-center gap-1 font-bold text-[11px] transition-all"
                              >
                                <Pencil className="w-3 h-3 text-teal-600" />
                                <span>Edit Content</span>
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
          )}

          {/* Footer info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs text-slate-500">
            <span>Showing {filteredSetups.length} of {setups.length} Marksheet Setups</span>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-600 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>PostgreSQL & Admit Card Synchronized</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ADMIT CARDS & TIMETABLES MANAGEMENT                      */}
      {/* ============================================================== */}
      {activeTab === 'admit-card' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Class or Exam Name..."
                value={admitSearchQuery}
                onChange={e => setAdmitSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              <select
                value={admitSelectedSession}
                onChange={e => setAdmitSelectedSession(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800"
              >
                <option value="2025-2026">Session: 2025-2026</option>
                <option value="2024-2025">Session: 2024-2025</option>
                <option value="2026-2027">Session: 2026-2027</option>
              </select>

              <select
                value={admitFilterClass}
                onChange={e => setAdmitFilterClass(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <Link
                href="/institute/admit-card/time-table"
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Exam Timetables
              </Link>

              <Link
                href="/institute/admit-card/create"
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create Admit Card
              </Link>
            </div>
          </div>

          {/* Admit Cards Table Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-center border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-4 w-16 text-left">S. No.</th>
                    <th className="px-4 py-4 text-left">Exam Title & Class</th>
                    <th className="px-4 py-4">Session</th>
                    <th className="px-4 py-4 text-left">Label</th>
                    <th className="px-4 py-4">Live Preview</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Created At</th>
                    <th className="px-4 py-4 w-28 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredAdmitCards.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 text-left text-slate-400 font-bold">{idx + 1}.</td>
                      
                      <td className="px-4 py-3.5 text-left font-bold text-slate-800 dark:text-slate-200">
                        <div>{item.examName}</div>
                        <span className="text-[10.5px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                          {item.className}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">{item.session}</td>
                      
                      <td className="px-4 py-3.5 text-left text-slate-600 dark:text-slate-400 font-semibold">
                        {item.admitCardLabel}
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setPreviewCard(item)}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 flex items-center justify-center gap-1.5 transition-colors border border-teal-200 dark:border-teal-800 mx-auto font-bold"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          <span>View Card</span>
                        </button>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                          item.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-50 text-red-500'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-700 dark:text-slate-400">{item.dateCreated}</span>
                          <span>{item.timeCreated}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/institute/admit-card/create?editId=${item.id}`}
                            className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
                            title="Edit Admit Card"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteAdmitCard(item.id)}
                            className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-200/60 transition-colors"
                            title="Delete Admit Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredAdmitCards.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                        No Admit Cards found. Create an exam setup or click &quot;Simultaneous Sync&quot; above to auto-generate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
              <span>Showing {filteredAdmitCards.length} of {admitCards.length} Admit Cards</span>
              <button
                onClick={handleSyncAllAdmitCards}
                className="text-teal-600 hover:underline font-bold text-xs"
              >
                Re-sync from Exam Setups
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: HIGH-RES MARKSHEET PREVIEW MODAL                      */}
      {/* ============================================================== */}
      {previewSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto py-8">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                    Marksheet Live Preview • {previewSetup.templateName}
                  </h3>
                  <div className="text-[11px] text-purple-600 font-semibold">
                    {previewSetup.exam} • {previewSetup.classGrade} ({previewSetup.session || '2025-2026'})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch to Admit card preview */}
                <button
                  onClick={() => {
                    const linked = getLinkedAdmitCard(previewSetup)
                    if (linked) {
                      setPreviewSetup(null)
                      setPreviewCard(linked)
                    } else {
                      handleOpenAdmitCardForSetup(previewSetup)
                      setPreviewSetup(null)
                    }
                  }}
                  className="px-3 py-2 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  View Admit Card
                </button>

                <button
                  onClick={handlePrintMarksheet}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Marksheet
                </button>

                <button
                  onClick={() => setPreviewSetup(null)}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Marksheet Display Container */}
            <div className="p-6 md:p-8 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-x-auto">
              <div id="printable-marksheet-area" ref={printAreaRef} className="w-full max-w-[820px] shadow-2xl rounded-sm">
                <MarksheetPreview
                  templateName={previewSetup.templateName}
                  examName={previewSetup.exam}
                  className={previewSetup.classGrade}
                  academicYear={previewSetup.session || '2025-2026'}
                  subjects={previewSetup.config?.subjects}
                  percentRanges={previewSetup.config?.percentRanges}
                  gradeRanges={previewSetup.config?.gradeRanges}
                  schoolName={previewSetup.config?.schoolDetails?.schoolName}
                  affiliateTo={previewSetup.config?.schoolDetails?.affiliateTo}
                  schoolAddress={previewSetup.config?.schoolDetails?.schoolAddress}
                  phone={previewSetup.config?.schoolDetails?.phone}
                  principalName={previewSetup.config?.schoolDetails?.principalName}
                  headingHeader={previewSetup.config?.headingHeader}
                  showStudentPhoto={previewSetup.config?.showStudentPhoto ?? true}
                  showTestMarks={previewSetup.config?.showTestMarks ?? true}
                  showHeaderSign={previewSetup.config?.showHeaderSign ?? true}
                  showHeaderStamp={previewSetup.config?.showHeaderStamp ?? true}
                  columnsList={previewSetup.config?.columnsList}
                />
              </div>
            </div>

            {/* Modal Footer Info */}
            <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span><strong>Exam:</strong> {previewSetup.exam}</span>
                <span>•</span>
                <span><strong>Grade Scheme:</strong> {previewSetup.marksGrade}</span>
                <span>•</span>
                <span><strong>Template:</strong> {previewSetup.templateName}</span>
              </div>
              <span className="text-[11px] text-teal-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Synchronized with PostgreSQL
              </span>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: HIGH-RES ADMIT CARD MODAL                             */}
      {/* ============================================================== */}
      {previewCard && (
        <AdmitCardModalPreview
          card={previewCard}
          onClose={() => setPreviewCard(null)}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL 3: QUICK ADD SETUP & ADMIT CARD (SIMULTANEOUSLY)         */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto py-10">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            {/* Header */}
            <div className="px-7 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                    {editingSetup ? 'Edit Setup & Admit Card' : 'Quick Add Exam Setup & Admit Card'}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Simultaneously creates both Marksheet configuration & Admit Card
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-7 flex flex-col gap-4">
              
              {/* Group */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Exam Group Scheme <span className="text-red-500">*</span>
                </label>
                <select
                  value={formGroup}
                  onChange={e => setFormGroup(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="Exam">Exam</option>
                  <option value="Theory Exam">Theory Exam</option>
                  <option value="Practical Exam">Practical Exam</option>
                  <option value="Term 1 Scheme">Term 1 Scheme</option>
                  <option value="Term 2 Scheme">Term 2 Scheme</option>
                  {availableGroups.filter(g => !['Exam', 'Theory Exam', 'Practical Exam', 'Term 1 Scheme', 'Term 2 Scheme'].includes(g)).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Exam Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Exam Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formExam}
                  onChange={e => setFormExam(e.target.value)}
                  placeholder="e.g. Half Yearly Examination 2025-26"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Added Class Dropdown */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    Select Added Class <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                    Institute Master Classes
                  </span>
                </div>
                <select
                  required
                  value={formClassGrade}
                  onChange={e => handleModalClassChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
                >
                  <option value="">-- Choose Added Class --</option>
                  {masterClasses.map(m => (
                    <option key={m.className} value={m.className}>
                      {m.className} ({m.sections.length} Sections)
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Select Sections */}
              <div className="flex flex-col gap-1.5">
                {(() => {
                  const currentClassObj = masterClasses.find(m => m.className === formClassGrade)
                  const availableSecs = currentClassObj?.sections || ['Section A', 'Section B', 'Section C']
                  const allSelected = formSections.length === availableSecs.length && availableSecs.length > 0

                  return (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <span>Class Sections</span>
                          <span className="text-red-500">*</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            {formSections.length} Selected
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSelectAllModalSections(availableSecs)}
                          className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          {allSelected ? 'Deselect All' : 'Select All Sections'}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {availableSecs.map(sec => {
                          const isChecked = formSections.includes(sec)
                          return (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => handleToggleModalSection(sec)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-xs ${
                                isChecked
                                  ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-500/20'
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                              }`}
                            >
                              <Check className={`w-3.5 h-3.5 stroke-[3] transition-all ${isChecked ? 'opacity-100' : 'opacity-20'}`} />
                              <span>{sec}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Marks Scheme, Session, Exam Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">Marks Scheme</label>
                  <select
                    value={formMarksGrade}
                    onChange={e => setFormMarksGrade(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Grading Scale">Grading Scale</option>
                    <option value="GPA / CGPA">GPA / CGPA</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">Session</label>
                  <select
                    value={formSession}
                    onChange={e => setFormSession(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">Exam Date</label>
                  <input
                    type="date"
                    value={formExamDate}
                    onChange={e => setFormExamDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Template Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Marksheet Layout Template
                </label>
                <select
                  value={formTemplateName}
                  onChange={e => setFormTemplateName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="Purple Classic">Purple Classic (Portrait)</option>
                  <option value="Scholastic Term Split">Scholastic Term Split (Maroon)</option>
                  <option value="Skills Aspect Grid">Skills Aspect Grid (Indigo)</option>
                  <option value="Classic Navy">Classic Navy (Traditional)</option>
                </select>
              </div>

              {/* SIMULTANEOUS ADMIT CARD OPTION (HIGHLIGHTED) */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex flex-col gap-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CheckSquare className={`w-4 h-4 ${autoGenerateAdmitCard ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-black text-teal-900 dark:text-teal-200">
                      Auto-generate Admit Card & Timetable simultaneously
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoGenerateAdmitCard}
                    onChange={e => setAutoGenerateAdmitCard(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                    autoGenerateAdmitCard ? 'bg-teal-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}>
                    <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                  </div>
                </label>
                <p className="text-[10px] text-teal-700/80 dark:text-teal-300/80">
                  When enabled, this exam setup will immediately generate an active Admit Card & examination timetable with student fields ready for preview and printing.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                      Saving simultaneously...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {editingSetup ? 'Update Both' : 'Save Both Simultaneously'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: CREATE GROUP POPUP MODAL                              */}
      {/* ============================================================== */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto py-10">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            <div className="px-7 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                    Create Exam Group
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Add new scheme to PostgreSQL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-7 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Group Scheme Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="e.g. Unit Test Scheme, Term 1 Scheme"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  placeholder="e.g. Summative assessments for secondary classes"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingGroup}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingGroup ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Create Group
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, Plus, Pencil, Trash2, X, AlertTriangle, Eye, Printer,
  Sparkles, RefreshCw, BookOpen, Layers, Check, CheckCircle2, ShieldCheck,
  FileText, LayoutTemplate, School, Calendar, ChevronRight, FileCheck,
  QrCode, Clock, ArrowRight, ToggleLeft, ToggleRight, CheckSquare, List, Award, Palette
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
import { MarksheetPreview, MarksheetMiniPreview } from '@/components/marksheets/MarksheetPreview'
import { AdmitCardModalPreview, AdmitCardMiniPreview } from '@/components/admit-card/AdmitCardModalPreview'
import { CertificatePaper } from '@/components/certificates/CertificateTemplates'
import { getInstituteAddedClasses, MasterClassWithSections } from '@/lib/institute-classes'
import {
  AdmitCardConfig,
  TimeTableEntry,
  getStoredAdmitCards,
  saveStoredAdmitCards,
  getStoredTimetables,
  saveStoredTimetables,
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
  const [previewCertSetup, setPreviewCertSetup] = useState<ExamMarksheetSetupRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  // Master added classes & sections
  const [masterClasses, setMasterClasses] = useState<MasterClassWithSections[]>([])

  // Form fields for Quick Add / Edit Modal
  const [formGroup, setFormGroup] = useState('Quarterly')
  const [formExam, setFormExam] = useState('')
  const [formClassGrade, setFormClassGrade] = useState('')
  const [formSections, setFormSections] = useState<string[]>([])
  const [formMarksGrade, setFormMarksGrade] = useState('Percentage')
  const [formTemplateName, setFormTemplateName] = useState('Purple Classic')
  const [formSession, setFormSession] = useState('2025-2026')
  const [formExamDate, setFormExamDate] = useState(new Date().toISOString().split('T')[0])
  const [autoGenerateAdmitCard, setAutoGenerateAdmitCard] = useState(true)
  const [formAdmitCardLabel, setFormAdmitCardLabel] = useState('Admit Card')

  // Modal Subject Configuration Interface & State
  interface ModalSubject {
    id: number
    subjectName: string
    examDate: string
    startTime: string
    endTime: string
    maxMarks: string
    practicalColumn: boolean
    practicalMarks: string
  }

  const [formSubjects, setFormSubjects] = useState<ModalSubject[]>([])
  const [formAdmitTemplateStyle, setFormAdmitTemplateStyle] = useState('Classic Board')
  const [formAdmitThemeColor, setFormAdmitThemeColor] = useState('#1e3a8a')
  const [availableMasterSubjects] = useState<string[]>([
    'Mathematics', 'English Core', 'General Science', 'Social Science', 'Hindi / Regional',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'General Knowledge', 'Economics'
  ])

  const handleAddModalSubject = () => {
    const last = formSubjects[formSubjects.length - 1]
    const nextDate = formExamDate || new Date().toISOString().split('T')[0]
    setFormSubjects(prev => [
      ...prev,
      {
        id: Date.now(),
        subjectName: '',
        examDate: nextDate,
        startTime: last?.startTime || '10:00',
        endTime: last?.endTime || '13:00',
        maxMarks: '100',
        practicalColumn: false,
        practicalMarks: ''
      }
    ])
  }

  const handleRemoveModalSubject = (subId: number) => {
    if (formSubjects.length <= 1) {
      toast.error('At least one subject is required.')
      return
    }
    setFormSubjects(prev => prev.filter(s => s.id !== subId))
  }

  const handleUpdateModalSubject = (subId: number, field: keyof ModalSubject, val: any) => {
    setFormSubjects(prev => prev.map(s => s.id === subId ? { ...s, [field]: val } : s))
  }

  // Create Group Popup State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [isSavingGroup, setIsSavingGroup] = useState(false)
  const [availableGroups, setAvailableGroups] = useState<string[]>([
    'Quarterly', 'Half Yearly', 'Yearly', 'Annually'
  ])

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

    // Auto-sync or clean up orphaned admit cards if setups are empty
    const storedCards = getStoredAdmitCards()
    if (!loadedSetups || loadedSetups.length === 0) {
      setAdmitCards([])
      saveStoredAdmitCards([])
      setTimetables([])
      saveStoredTimetables([])
    } else {
      const validSetupIds = new Set(loadedSetups.map(s => s.id))
      const cleanedCards = storedCards.filter(c => !c.setupId || validSetupIds.has(c.setupId))
      setAdmitCards(cleanedCards)
      saveStoredAdmitCards(cleanedCards)
      setTimetables(getStoredTimetables())

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
    const today = new Date().toISOString().split('T')[0]
    setEditingSetup(null)
    setFormGroup(availableGroups[0] || 'Exam')
    setFormExam('')
    setFormClassGrade(firstCls)
    setFormSections([...firstSecs])
    setFormMarksGrade('Percentage')
    setFormTemplateName('CBSE Royal Emerald')
    setFormAdmitTemplateStyle('Classic Board')
    setFormAdmitThemeColor('#1e3a8a')
    setFormSession('2025-2026')
    setFormExamDate(today)
    setAutoGenerateAdmitCard(true)
    setFormAdmitCardLabel('Admit Card')

    const defaultSubs: ModalSubject[] = [
      { id: 1, subjectName: 'English Core', examDate: today, startTime: '10:00', endTime: '13:00', maxMarks: '100', practicalColumn: true, practicalMarks: '20' },
      { id: 2, subjectName: 'Mathematics', examDate: today, startTime: '10:00', endTime: '13:00', maxMarks: '100', practicalColumn: false, practicalMarks: '' },
      { id: 3, subjectName: 'General Science', examDate: today, startTime: '10:00', endTime: '13:00', maxMarks: '100', practicalColumn: true, practicalMarks: '30' },
      { id: 4, subjectName: 'Social Science', examDate: today, startTime: '10:00', endTime: '13:00', maxMarks: '100', practicalColumn: false, practicalMarks: '' },
      { id: 5, subjectName: 'Hindi / Regional', examDate: today, startTime: '10:00', endTime: '13:00', maxMarks: '100', practicalColumn: false, practicalMarks: '' }
    ]
    setFormSubjects(defaultSubs)
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
    setFormTemplateName(setup.templateName || 'CBSE Royal Emerald')
    setFormAdmitTemplateStyle(setup.config?.admitTemplateStyle || setup.config?.admitCardSettings?.templateStyle || 'Classic Board')
    setFormAdmitThemeColor(setup.config?.admitThemeColor || setup.config?.admitCardSettings?.themeColor || '#1e3a8a')
    setFormSession(setup.session || '2025-2026')
    setFormExamDate(setup.examDate || new Date().toISOString().split('T')[0])
    setAutoGenerateAdmitCard(true)
    setFormAdmitCardLabel(setup.config?.admitCardSettings?.admitLabel || 'Admit Card')

    if (Array.isArray(setup.config?.subjects) && setup.config.subjects.length > 0) {
      setFormSubjects(setup.config.subjects.map((s: any, idx: number) => ({
        id: s.id || (idx + 1),
        subjectName: s.subjectName || '',
        examDate: s.examDate || setup.examDate || new Date().toISOString().split('T')[0],
        startTime: s.startTime || s.fromTime || '10:00',
        endTime: s.endTime || s.toTime || '13:00',
        maxMarks: s.maxMarks ? String(s.maxMarks) : '100',
        practicalColumn: !!s.practicalColumn,
        practicalMarks: s.practicalMarks ? String(s.practicalMarks) : ''
      })))
    } else {
      const today = setup.examDate || new Date().toISOString().split('T')[0]
      setFormSubjects([
        { id: 1, subjectName: 'English Core', examDate: today, startTime: '10:00', endTime: '13:00', maxMarks: '100', practicalColumn: true, practicalMarks: '20' },
        { id: 2, subjectName: 'Mathematics', examDate: today, startTime: '10:00', endTime: '13:00', maxMarks: '100', practicalColumn: false, practicalMarks: '' },
        { id: 3, subjectName: 'General Science', examDate: today, startTime: '10:00', endTime: '13:00', maxMarks: '100', practicalColumn: true, practicalMarks: '30' },
        { id: 4, subjectName: 'Social Science', examDate: today, startTime: '10:00', endTime: '13:00', maxMarks: '100', practicalColumn: false, practicalMarks: '' },
        { id: 5, subjectName: 'Hindi / Regional', examDate: today, startTime: '10:00', endTime: '13:00', maxMarks: '100', practicalColumn: false, practicalMarks: '' }
      ])
    }
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
    if (formSubjects.length === 0) {
      toast.error('Please add at least one subject to the schedule.')
      return
    }
    for (const sub of formSubjects) {
      if (!sub.subjectName.trim()) {
        toast.error('Please fill in Subject Name for all subjects in the schedule.')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const formattedClassGrade = formSections.length > 0
        ? `${formClassGrade} (${formSections.map(s => s.replace('Section ', 'Sec ')).join(', ')})`
        : formClassGrade

      const configData = {
        ...(editingSetup?.config || {}),
        className: formClassGrade,
        sections: formSections,
        subjects: formSubjects,
        templateName: formTemplateName,
        admitTemplateStyle: formAdmitTemplateStyle,
        admitThemeColor: formAdmitThemeColor,
        admitCardSettings: {
          ...(editingSetup?.config?.admitCardSettings || {}),
          admitLabel: formAdmitCardLabel,
          templateStyle: formAdmitTemplateStyle,
          themeColor: formAdmitThemeColor,
        },
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

      if (res?.success) {
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
        toast.error(res?.error || 'Failed to save setup')
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

  // Statistics for Overview Cards: Total, Upcoming, Result Pending, Fully Completed
  const examStats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0)
    let upcoming = 0
    let resultPending = 0
    let fullyCompleted = 0

    setups.forEach(s => {
      if (s.lockExam || s.config?.status === 'Completed' || s.config?.status === 'Fully Completed') {
        fullyCompleted++
        return
      }
      const raw = s.examDate || s.config?.examDate || s.date
      if (raw) {
        try {
          const d = new Date(raw)
          if (!isNaN(d.getTime())) {
            if (d.getTime() >= today) {
              upcoming++
            } else {
              resultPending++
            }
            return
          }
        } catch (e) {}
      }
      upcoming++
    })

    return {
      total: setups.length,
      upcoming,
      resultPending,
      fullyCompleted
    }
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/5 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60">
              <School className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Institute Portal</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Examination & Hall Tickets</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <span>Exam Marksheet & Admit Card Setup</span>
            </h1>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              ⚡ Real-time Sync Active
            </span>
          </div>

          <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
            Unified examination management workspace. Configure class timetables, printable marksheets, QR-verified hall tickets, and student certificates in real-time synchronization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            type="button"
            onClick={handleSyncAllAdmitCards}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-2 shadow-2xs"
            title="Synchronize Hall Tickets & Schedules for all active setups"
          >
            <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
            <span>Simultaneous Sync</span>
          </button>

          <Link
            href="/institute/exam-marksheet/setup/create"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-teal-600/25 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Exam Setup (Wizard)</span>
          </Link>
        </div>
      </div>

      {/* Synchronized Metrics Summary: Total, Upcoming, Result Pending, Fully Completed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Exams
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {examStats.total}
            </span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
              Total Setups
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            All configured examination schemes
          </p>
        </div>

        {/* Metric 2: Upcoming */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Upcoming Exams
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-blue-600 tracking-tight">
              {examStats.upcoming}
            </span>
            <span className="text-[11px] text-blue-600 font-bold">
              Upcoming
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Scheduled dates & admit cards ready
          </p>
        </div>

        {/* Metric 3: Result Pending */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Result Pending
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-amber-600 tracking-tight">
              {examStats.resultPending}
            </span>
            <span className="text-[11px] text-amber-600 font-bold">
              Result Pending
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Exams conducted, awaiting evaluation
          </p>
        </div>

        {/* Metric 4: Fully Completed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Fully Completed
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-600 tracking-tight">
              {examStats.fullyCompleted}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold">
              Fully Completed
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Marksheets & certificates generated
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* UNIFIED TAB NAVIGATION (SIMULTANEOUS WORKSPACE)                 */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl w-fit border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('marksheet')}
            className={`flex items-center gap-2.5 px-5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'marksheet'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Exam & Marksheet Setup</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'marksheet'
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {setups.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admit-card')}
            className={`flex items-center gap-2.5 px-5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'admit-card'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>2. Admit Cards & Timetables</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'admit-card'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {admitCards.length}
            </span>
          </button>
        </div>

        {/* Simultaneous Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 px-3.5 py-2 rounded-xl w-fit shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-800 dark:text-emerald-300 font-bold">
            Simultaneous Sync Mode: Marksheets & Admit Cards work in real-time
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: EXAM & MARKSHEET SETUP TABLE (WITH ADMIT CARD ACTIONS)   */}
      {/* ============================================================== */}
      {activeTab === 'marksheet' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search exam, class, group..."
                  className="pl-9 pr-8 py-2 w-full border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
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
                className="px-3 py-2 bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 transition-all cursor-pointer"
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
                className="px-3 py-2 bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 transition-all cursor-pointer"
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
                className="px-3 py-2 bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 transition-all cursor-pointer"
              >
                <option value="ALL">All Templates</option>
                {uniqueTemplates.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {(selectedGroup !== 'ALL' || selectedClass !== 'ALL' || selectedTemplate !== 'ALL' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGroup('ALL')
                    setSelectedClass('ALL')
                    setSelectedTemplate('ALL')
                    setSearchQuery('')
                  }}
                  className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 font-bold px-2 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/institute/exam-marksheet/setup/create"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Setup (Wizard)</span>
              </Link>

              <button
                type="button"
                onClick={loadAllData}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Refresh All Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* ─── EXAMS LIST / TABLE OR STRUCTURED EMPTY STATE ─── */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center mb-3">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Loading Examination Setups...
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Fetching latest marksheets, synchronized admit cards, and timetables
              </p>
            </div>
          ) : filteredSetups.length === 0 ? (
            /* Structured Modern Empty State Hero Card */
            <div className="bg-gradient-to-b from-slate-50/80 via-teal-50/20 to-transparent dark:from-slate-800/40 dark:to-transparent border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/25">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                No Examination Setups Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl leading-relaxed">
                You haven&apos;t created any examination setups yet, or no setups match your current filters. Launch our step-by-step setup wizard to configure exam schedules, marksheets, admit cards, and certificates.
              </p>

              {/* 3 Step Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 max-w-2xl w-full text-left">
                <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 p-3.5 rounded-2xl shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center text-[10px] font-black">
                      1
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Exam Details</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Define exam name, dates, grading system & subject timetable
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 p-3.5 rounded-2xl shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-[10px] font-black">
                      2
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Marksheet & Admit</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pick from 4 templates with live color picker & preview
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 p-3.5 rounded-2xl shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center text-[10px] font-black">
                      3
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Certificates</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Award certificates with crests, QR validation & seal
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/institute/exam-marksheet/setup/create"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Launch 5-Step Setup Wizard</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in duration-300">
              <table className="w-full text-xs text-center whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5 text-left">S. No.</th>
                    <th className="px-4 py-3.5 text-left">Group</th>
                    <th className="px-4 py-3.5 text-left">Exam Name</th>
                    <th className="px-4 py-3.5 text-center">Class Grade</th>
                    <th className="px-4 py-3.5 text-center">Exam Start Date</th>
                    <th className="px-4 py-3.5 text-center">Preview Designs (Admit, Marksheet, Certificate)</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredSetups.map((item, i) => {
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
                          <div className="text-sm font-black">{item.exam}</div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-normal mt-0.5">
                            <span>Session: {item.session || '2025-2026'}</span>
                            {(item.examDate || item.config?.examDate) && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Starts: {item.examDate || item.config?.examDate}
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Class Grade */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto">
                            {(item.classGrade || '').split(', ').map((cls, cIdx) => (
                              <span key={cIdx} className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-2xs">
                                {cls.trim()}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Exam Start Date */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 shadow-2xs">
                            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>
                              {(() => {
                                const raw = item.examDate || item.config?.examDate || item.config?.subjects?.[0]?.examDate || item.date
                                if (!raw) return 'Not Set'
                                try {
                                  if (raw.includes('-')) {
                                    const d = new Date(raw)
                                    if (!isNaN(d.getTime())) {
                                      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                    }
                                  }
                                } catch (e) {}
                                return raw
                              })()}
                            </span>
                          </span>
                        </td>

                        {/* Preview Designs (Admit, Marksheet, Certificate) with proper buttons */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            {/* Admit Card Preview Button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (linkedCard) {
                                  setPreviewCard(linkedCard)
                                } else {
                                  handleOpenAdmitCardForSetup(item)
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-2xs transition-all active:scale-95"
                              title="Preview Created Admit Card Design"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Admit Card</span>
                            </button>

                            {/* Marksheet Preview Button */}
                            <button
                              type="button"
                              onClick={() => setPreviewSetup(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 shadow-2xs transition-all active:scale-95"
                              title="Preview Created Marksheet Design"
                            >
                              <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              <span>Marksheet</span>
                            </button>

                            {/* Certificate Preview Button */}
                            <button
                              type="button"
                              onClick={() => setPreviewCertSetup(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-2xs transition-all active:scale-95"
                              title="Preview Created Certificate Design"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>Certificate</span>
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/institute/exam-marksheet/setup/create?id=${item.id}`}
                              title="Edit Setup in Full Wizard"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-800 font-bold text-xs transition-all active:scale-95 shadow-2xs"
                            >
                              <Pencil className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                              <span>Edit</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.exam)}
                              disabled={isDeletingId === item.id}
                              title="Delete Exam Setup"
                              className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/60 flex items-center justify-center transition-all disabled:opacity-50 active:scale-95 shadow-2xs"
                            >
                              {isDeletingId === item.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
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
            {filteredAdmitCards.length === 0 ? (
              <div className="bg-gradient-to-b from-slate-50/80 via-emerald-50/20 to-transparent dark:from-slate-800/40 dark:to-transparent border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-4">
                  <FileCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  No Admit Cards Available Yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg leading-relaxed">
                  Admit cards are automatically generated in real-time whenever you create an examination marksheet setup. You can also create custom hall tickets manually.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleSyncAllAdmitCards}
                    className="px-5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 transition-all shadow-2xs"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Sync from Exam Setups</span>
                  </button>

                  <Link
                    href="/institute/exam-marksheet/setup/create"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Exam Setup (Wizard)</span>
                  </Link>
                </div>
              </div>
            ) : (
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
                            type="button"
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
                              type="button"
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
                  </tbody>
                </table>
              </div>
            )}

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
      {/* MODAL 3: EXAM SETUP, ADMIN TEMPLATES & ADMIT CARD BUILDER      */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>{editingSetup ? 'Edit Exam Setup & Admit Card' : 'Create Exam Setup & Admit Card'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      All-in-One Synchronized
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Choose admin-provided Marksheet & Admit Card templates, configure class, sections & subject timetable
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingSetup && (
                  <Link
                    href={`/institute/exam-marksheet/setup/create?id=${editingSetup.id}`}
                    className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>Open Full 4-Step Wizard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body Scroll Container */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              
              {/* SECTION 1: ADMIN TEMPLATES (MARKSHEET & ADMIT CARD) - FIRST ASK TEMPLATE DESIGN */}
              <div className="bg-gradient-to-r from-teal-50/60 via-purple-50/40 to-blue-50/40 dark:from-teal-950/30 dark:via-purple-950/20 dark:to-blue-950/20 p-5 rounded-2xl border border-teal-200/80 dark:border-teal-800/60 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-teal-200/60 dark:border-teal-800/60 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
                      <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-600 text-white">
                          First Step
                        </span>
                        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                          1. Choose Template Designs (Provided by Admin)
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Admin provides verified layouts. Select Marksheet & Admit Card styles before entering class & schedule details.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const tempItem: ExamMarksheetSetupRecord = {
                          id: '999999',
                          exam: formExam || 'Examination 2025-26',
                          group: formGroup,
                          classGrade: formClassGrade || 'Class 10',
                          marksGrade: 'Percentage',
                          templateName: formTemplateName,
                          date: new Date().toLocaleDateString('en-GB'),
                          time: '',
                          session: formSession,
                          config: {
                            className: formClassGrade || 'Class 10',
                            sections: formSections,
                            subjects: formSubjects,
                            templateName: formTemplateName,
                            admitTemplateStyle: formAdmitTemplateStyle,
                            schoolDetails: {
                              schoolName: 'COSMOPOLITAN INTER COLLEGE',
                              affiliateTo: 'CBSE New Delhi',
                              schoolAddress: 'Green Park Sector 4, New Delhi',
                              schoolCode: '123456',
                              phone: '011-2345678',
                              email: 'dps@example.com',
                              principalName: 'Mrs. Shailaja Sen',
                              academicYear: formSession
                            }
                          }
                        }
                        setPreviewSetup(tempItem)
                      }}
                      className="px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      <span>Marksheet Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const tempCard: AdmitCardConfig = {
                          id: 999999,
                          className: formClassGrade || 'Class X',
                          examName: formExam || 'Final Term Examination',
                          admitCardLabel: 'Admit Card',
                          timeTableId: 999999,
                          session: formSession,
                          schoolName: 'COSMOPOLITAN INTER COLLEGE',
                          schoolAddress: 'Green Park Sector 4, New Delhi',
                          templateStyle: formAdmitTemplateStyle,
                          themeColor: formAdmitThemeColor,
                          displayFields: {
                            name: true, fatherName: true, motherName: true, mobileNo: false,
                            admissionNo: true, registrationNo: true, rollNo: true, enrollmentNo: false,
                            dob: true, address: true, class: true, section: true, photo: true,
                            studentSign: true, teacherSign: true, principalSign: true, parentSign: true,
                            schoolStamp: false
                          },
                          status: 'Active',
                          instructions: '1. Candidates must arrive at the examination center 30 minutes before scheduled time.\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices are strictly prohibited in the exam hall.',
                          showExamTimeTable: true,
                          noOfPrintPerPage: '1',
                          headerNameFontSize: '22',
                          headerDetailsFontSize: '10',
                          studentDetailsFontSize: '11',
                          timetableDetailsFontSize: '11',
                          headingFontSize: '13',
                          defaultFontSize: '9',
                          spacing: '20',
                          studentPhotoSize: '100',
                          teacherSignLabel: "Class Teacher's Sign.",
                          studentSignLabel: "Student's Sign.",
                          parentSignLabel: "Parent's Sign.",
                          principalSignLabel: "Principal's Sign.",
                          signatureWidth: '30',
                          schoolStampWidth: '30',
                          dateCreated: new Date().toLocaleDateString('en-GB'),
                          timeCreated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                        setPreviewCard(tempCard)
                      }}
                      className="px-3 py-1.5 rounded-xl border border-teal-300 dark:border-teal-800 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      <span>Admit Card Preview</span>
                    </button>
                  </div>
                </div>

                {/* Part A: Marksheet Templates */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <School className="w-4 h-4 text-purple-600" />
                      <span>A. Marksheet Layout Template</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                      Selected: {formTemplateName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      {
                        name: 'CBSE Royal Emerald',
                        tag: 'Official CBSE',
                        desc: 'Board Standard with Gold Crest & Dual Term matrix',
                        color: 'border-emerald-500 bg-emerald-50/50 text-emerald-800',
                        pill: 'bg-emerald-100 text-emerald-800'
                      },
                      {
                        name: 'Scholastic Term Split',
                        tag: 'Dual-Term Evaluation',
                        desc: 'Maroon header with Term 1 & Term 2 split marks',
                        color: 'border-rose-500 bg-rose-50/50 text-rose-800',
                        pill: 'bg-rose-100 text-rose-800'
                      },
                      {
                        name: 'Skills Aspect Grid',
                        tag: 'Holistic 360°',
                        desc: 'Competency grid & Co-scholastic performance',
                        color: 'border-teal-500 bg-teal-50/50 text-teal-800',
                        pill: 'bg-teal-100 text-teal-800'
                      },
                      {
                        name: 'Classic Navy',
                        tag: 'Modern Academic',
                        desc: 'Executive Navy format with Grade & Percentage summary',
                        color: 'border-blue-600 bg-blue-50/50 text-blue-900',
                        pill: 'bg-blue-100 text-blue-800'
                      },
                      {
                        name: 'Purple Classic',
                        tag: 'CBSE Royal',
                        desc: 'Traditional Royal Purple layout with QR Verification',
                        color: 'border-purple-600 bg-purple-50/50 text-purple-900',
                        pill: 'bg-purple-100 text-purple-800'
                      }
                    ].map(tmpl => {
                      const isSelected = formTemplateName === tmpl.name
                      return (
                        <div
                          key={tmpl.name}
                          onClick={() => setFormTemplateName(tmpl.name)}
                          className={`cursor-pointer rounded-2xl border p-3 flex flex-col justify-between gap-2 transition-all relative ${
                            isSelected
                              ? `${tmpl.color} ring-2 ring-teal-500/30 shadow-md`
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${tmpl.pill}`}>
                              {tmpl.tag}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                          </div>

                          {/* Mini Preview */}
                          <MarksheetMiniPreview
                            template={tmpl.name}
                            schoolName="COSMOPOLITAN INTER COLLEGE"
                            examName={formExam || 'Annual Examination 2025-26'}
                            academicYear={formSession}
                            isSelected={isSelected}
                          />

                          <div>
                            <div className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">
                              {tmpl.name}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                              {tmpl.desc}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[9px] font-bold">
                            <span className={isSelected ? 'text-teal-700 dark:text-teal-300' : 'text-slate-400'}>
                              {isSelected ? '✓ Selected' : 'Click to Pick'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                const tempItem: ExamMarksheetSetupRecord = {
                                  id: '999999',
                                  exam: formExam || 'Examination 2025-26',
                                  group: formGroup,
                                  classGrade: formClassGrade || 'Class 10',
                                  marksGrade: 'Percentage',
                                  templateName: tmpl.name,
                                  date: new Date().toLocaleDateString('en-GB'),
                                  time: '',
                                  session: formSession,
                                  config: {
                                    className: formClassGrade || 'Class 10',
                                    sections: formSections,
                                    subjects: formSubjects,
                                    templateName: tmpl.name,
                                    admitTemplateStyle: formAdmitTemplateStyle,
                                    schoolDetails: {
                                      schoolName: 'COSMOPOLITAN INTER COLLEGE',
                                      affiliateTo: 'CBSE New Delhi',
                                      schoolAddress: 'Green Park Sector 4, New Delhi',
                                      schoolCode: '123456',
                                      phone: '011-2345678',
                                      email: 'dps@example.com',
                                      principalName: 'Mrs. Shailaja Sen',
                                      academicYear: formSession
                                    }
                                  }
                                }
                                setPreviewSetup(tempItem)
                              }}
                              className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 hover:bg-teal-50 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-600 flex items-center gap-1 font-bold transition-all shadow-2xs hover:scale-105"
                            >
                              <Eye className="w-2.5 h-2.5 text-teal-600" />
                              <span>Preview</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Part B: Admit Card Templates & Color Customizer */}
                <div className="flex flex-col gap-3 pt-3 border-t border-teal-200/60 dark:border-teal-800/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-teal-600" />
                      <span>B. Admit Card (Hall Ticket) Template & Theme Color</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                        Selected: {formAdmitTemplateStyle}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-2xs font-mono"
                        style={{ backgroundColor: formAdmitThemeColor }}
                      >
                        {formAdmitThemeColor}
                      </span>
                    </div>
                  </div>

                  {/* Theme Color Customizer Inline */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: formAdmitThemeColor }}
                      >
                        <Palette className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                          Theme Accent Color
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Customize the primary color for borders, headers & badges
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
                        <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-700 dark:text-slate-200">
                          <input
                            type="color"
                            value={formAdmitThemeColor}
                            onChange={(e) => setFormAdmitThemeColor(e.target.value)}
                            className="w-5 h-5 rounded border-0 cursor-pointer p-0 bg-transparent"
                          />
                          <span>Color Picker</span>
                        </label>
                        <span className="text-slate-300">|</span>
                        <input
                          type="text"
                          value={formAdmitThemeColor}
                          onChange={(e) => setFormAdmitThemeColor(e.target.value)}
                          placeholder="#1e3a8a"
                          maxLength={7}
                          className="w-16 text-[10px] font-mono font-bold uppercase bg-transparent outline-none text-slate-800 dark:text-slate-100"
                        />
                      </div>

                      {/* Quick Presets */}
                      {[
                        { name: 'Navy', hex: '#1E3A8A' },
                        { name: 'Emerald', hex: '#047857' },
                        { name: 'Crimson', hex: '#991B1B' },
                        { name: 'Slate', hex: '#334155' },
                        { name: 'Indigo', hex: '#4338CA' },
                        { name: 'Teal', hex: '#0F766E' }
                      ].map(preset => {
                        const isCur = formAdmitThemeColor.toLowerCase() === preset.hex.toLowerCase()
                        return (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setFormAdmitThemeColor(preset.hex)}
                            title={preset.name}
                            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                              isCur ? 'ring-2 ring-teal-500 scale-110' : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: preset.hex }}
                          >
                            {isCur && <Check className="w-3 h-3 text-white" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        name: 'Classic Board',
                        legacyName: 'Classic Navy',
                        desc: 'Traditional Board Hall Ticket with full Timetable Matrix & Specimen Signature Box',
                        badge: 'Board Style',
                        pill: 'bg-blue-100 text-blue-800'
                      },
                      {
                        name: 'Modern Split Pass',
                        legacyName: 'Modern Emerald',
                        desc: 'Dynamic Dual-Column Layout with Student Profile Sidebar & Verification QR Code',
                        badge: 'Academy Pass',
                        pill: 'bg-emerald-100 text-emerald-800'
                      },
                      {
                        name: 'Executive Heritage',
                        legacyName: 'Executive Crimson',
                        desc: 'Prestigious Certificate Format with Ornate Filigree & Official Department Seal',
                        badge: 'Heritage Crest',
                        pill: 'bg-rose-100 text-rose-800'
                      },
                      {
                        name: 'Compact Minimalist',
                        legacyName: 'Minimalist Slate',
                        desc: 'High-Density Slip with Top Barcode Header & Detachable Invigilator Attendance Stub',
                        badge: 'Detachable Stub',
                        pill: 'bg-slate-200 text-slate-800'
                      }
                    ].map(style => {
                      const isSelected = formAdmitTemplateStyle === style.name || formAdmitTemplateStyle === style.legacyName
                      return (
                        <div
                          key={style.name}
                          onClick={() => setFormAdmitTemplateStyle(style.name)}
                          className={`cursor-pointer rounded-2xl border p-3 flex flex-col justify-between gap-2 transition-all relative ${
                            isSelected
                              ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/30 shadow-md'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${style.pill}`}>
                              {style.badge}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                          </div>

                          {/* Small Live Preview */}
                          <AdmitCardMiniPreview
                            template={style.name}
                            themeColor={formAdmitThemeColor}
                            schoolName="COSMOPOLITAN INTER COLLEGE"
                            examName={formExam || 'Final Term Examination'}
                            session={formSession}
                            isSelected={isSelected}
                          />

                          <div>
                            <div className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">
                              {style.name}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                              {style.desc}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[9px] font-bold">
                            <span className={isSelected ? 'text-teal-700 dark:text-teal-300' : 'text-slate-400'}>
                              {isSelected ? '✓ Selected' : 'Click to Pick'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                const tempCard: AdmitCardConfig = {
                                  id: 999999,
                                  className: formClassGrade || 'Class X',
                                  examName: formExam || 'Final Term Examination',
                                  admitCardLabel: formAdmitCardLabel || 'Admit Card',
                                  timeTableId: 999999,
                                  session: formSession,
                                  schoolName: 'COSMOPOLITAN INTER COLLEGE',
                                  schoolAddress: 'Green Park Sector 4, New Delhi',
                                  templateStyle: style.name,
                                  themeColor: formAdmitThemeColor,
                                  displayFields: {
                                    name: true, fatherName: true, motherName: true, mobileNo: false,
                                    admissionNo: true, registrationNo: true, rollNo: true, enrollmentNo: false,
                                    dob: true, address: true, class: true, section: true, photo: true,
                                    studentSign: true, teacherSign: true, principalSign: true, parentSign: true,
                                    schoolStamp: false
                                  },
                                  status: 'Active',
                                  instructions: '1. Candidates must arrive at the examination center 30 minutes before scheduled time.\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices are strictly prohibited in the exam hall.',
                                  showExamTimeTable: true,
                                  noOfPrintPerPage: '1',
                                  headerNameFontSize: '22',
                                  headerDetailsFontSize: '10',
                                  studentDetailsFontSize: '11',
                                  timetableDetailsFontSize: '11',
                                  headingFontSize: '13',
                                  defaultFontSize: '9',
                                  spacing: '20',
                                  studentPhotoSize: '100',
                                  teacherSignLabel: "Class Teacher's Sign.",
                                  studentSignLabel: "Student's Sign.",
                                  parentSignLabel: "Parent's Sign.",
                                  principalSignLabel: "Principal's Sign.",
                                  signatureWidth: '30',
                                  schoolStampWidth: '30',
                                  dateCreated: new Date().toLocaleDateString('en-GB'),
                                  timeCreated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                }
                                setPreviewCard(tempCard)
                              }}
                              className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 hover:bg-teal-50 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-600 flex items-center gap-1 font-bold transition-all shadow-2xs hover:scale-105"
                            >
                              <Eye className="w-2.5 h-2.5 text-teal-600" />
                              <span>Preview</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 2: EXAM BASIC INFORMATION */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>2. Examination Basic Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Group */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Exam Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formGroup}
                      onChange={e => setFormGroup(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Exam Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formExam}
                      onChange={e => setFormExam(e.target.value)}
                      placeholder="e.g. Half Yearly Exam 2025-26"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  {/* Session */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Academic Session</label>
                    <select
                      value={formSession}
                      onChange={e => setFormSession(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    >
                      <option value="2025-2026">2025-2026</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2026-2027">2026-2027</option>
                    </select>
                  </div>

                  {/* Primary Exam Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Exam Start Date</label>
                    <input
                      type="date"
                      value={formExamDate}
                      onChange={e => {
                        setFormExamDate(e.target.value)
                        setFormSubjects(prev => prev.map((s, idx) => idx === 0 ? { ...s, examDate: e.target.value } : s))
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: CLASS & SECTIONS SELECTION */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-3">
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-teal-600" />
                    <span>3. Class & Sections Selection</span>
                  </div>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                    Connected with Institute Master Classes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Select Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formClassGrade}
                      onChange={e => handleModalClassChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
                    >
                      <option value="">-- Choose Class --</option>
                      {masterClasses.map(m => (
                        <option key={m.className} value={m.className}>
                          {m.className} ({m.sections.length} Sections)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    {(() => {
                      const currentClassObj = masterClasses.find(m => m.className === formClassGrade)
                      const availableSecs = currentClassObj?.sections || ['Section A', 'Section B', 'Section C']
                      const allSelected = formSections.length === availableSecs.length && availableSecs.length > 0

                      return (
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <span>Sections Included</span>
                              <span className="text-red-500">*</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200">
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
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-2xs ${
                                    isChecked
                                      ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-500/20'
                                      : 'bg-slate-50 dark:bg-slate-750 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
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
                </div>
              </div>

              {/* SECTION 4: CLASS SUBJECTS & TIMETABLE SCHEDULE (DATE & TIME) */}
              <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span>4. Class Subjects Schedule (Dates, Times & Marks)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Configure exam dates, start and end times, maximum marks and practicals for this class
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddModalSubject}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold hover:bg-teal-100 transition-colors shadow-2xs w-fit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                </div>

                {/* Datalist for fast subject autocomplete */}
                <datalist id="institute-subjects-list">
                  {availableMasterSubjects.map(sub => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>

                {/* Subject Schedule Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Subject Name *</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Exam Date</th>
                        <th className="py-2.5 px-3 min-w-[110px]">Start Time</th>
                        <th className="py-2.5 px-3 min-w-[110px]">End Time</th>
                        <th className="py-2.5 px-3 w-24">Max Marks</th>
                        <th className="py-2.5 px-3 min-w-[130px]">Practical</th>
                        <th className="py-2.5 px-2 w-12 text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {formSubjects.map((sub, idx) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2 px-3 text-center font-bold text-slate-400">
                            {idx + 1}.
                          </td>

                          <td className="py-2 px-3">
                            <input
                              type="text"
                              required
                              list="institute-subjects-list"
                              placeholder="e.g. Mathematics"
                              value={sub.subjectName}
                              onChange={e => handleUpdateModalSubject(sub.id, 'subjectName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <input
                              type="date"
                              value={sub.examDate}
                              onChange={e => handleUpdateModalSubject(sub.id, 'examDate', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <input
                              type="time"
                              value={sub.startTime}
                              onChange={e => handleUpdateModalSubject(sub.id, 'startTime', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <input
                              type="time"
                              value={sub.endTime}
                              onChange={e => handleUpdateModalSubject(sub.id, 'endTime', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={sub.maxMarks}
                              onChange={e => handleUpdateModalSubject(sub.id, 'maxMarks', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none text-center focus:border-teal-500"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={sub.practicalColumn}
                                  onChange={e => handleUpdateModalSubject(sub.id, 'practicalColumn', e.target.checked)}
                                  className="rounded text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Yes</span>
                              </label>
                              {sub.practicalColumn && (
                                <input
                                  type="number"
                                  placeholder="Marks"
                                  value={sub.practicalMarks}
                                  onChange={e => handleUpdateModalSubject(sub.id, 'practicalMarks', e.target.value)}
                                  className="w-16 px-1.5 py-1 rounded border border-slate-200 text-xs text-center font-bold"
                                />
                              )}
                            </div>
                          </td>

                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveModalSubject(sub.id)}
                              className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SIMULTANEOUS ADMIT CARD OPTION (HIGHLIGHTED) */}
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex flex-col gap-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className={`w-5 h-5 ${autoGenerateAdmitCard ? 'text-teal-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-xs font-black text-teal-900 dark:text-teal-200 block">
                        Auto-generate Admit Card & Timetable simultaneously
                      </span>
                      <span className="text-[10.5px] text-teal-700/80 dark:text-teal-300/80">
                        Immediate synchronized creation: Generates student hall ticket with chosen style & timetable
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoGenerateAdmitCard}
                    onChange={e => setAutoGenerateAdmitCard(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                    autoGenerateAdmitCard ? 'bg-teal-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}>
                    <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving simultaneously...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {editingSetup ? 'Update Exam & Admit Setup' : 'Save Both Simultaneously'}
                      </>
                    )}
                  </button>
                </div>
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
      {/* ============================================================== */}
      {/* MODAL 5: LIVE CERTIFICATE PREVIEW MODAL                         */}
      {/* ============================================================== */}
      {previewCertSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto py-8">
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto max-h-[94vh]">
            
            {/* Header */}
            <div className="px-7 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>Certificate Live Preview</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                      {previewCertSetup.config?.certTemplate || 'Certificate Design 1'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {previewCertSetup.exam} • {previewCertSetup.classGrade} ({previewCertSetup.session || '2025-2026'})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewCertSetup(null)}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Viewport */}
            <div className="p-6 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950/60 min-h-[460px]">
              <div 
                className="transition-transform duration-200 flex items-center justify-center"
                style={{ transform: 'scale(0.80)', transformOrigin: 'center' }}
              >
                <CertificatePaper 
                  template={previewCertSetup.config?.certTemplate || 'Certificate Design 1'}
                  themeColor={previewCertSetup.config?.certThemeColor || '#b45309'}
                  schoolName={previewCertSetup.config?.schoolDetails?.schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                  schoolLogo={previewCertSetup.config?.schoolDetails?.logo || ''}
                  logoWidth={60}
                  showLogo={true}
                  title={previewCertSetup.config?.certTitle || 'CERTIFICATE OF ACHIEVEMENT'}
                  subtitle={previewCertSetup.config?.certSubtitle || 'Excellence in Academics & Co-Curriculars'}
                  presentedTo={previewCertSetup.config?.certPresentedTo || 'THIS CERTIFICATE IS PROUDLY PRESENTED TO'}
                  content={previewCertSetup.config?.certDescription || 'This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session.'}
                  editable={false}
                  studentName="Aarav Sharma"
                  fatherName="Rajesh Sharma"
                  motherName="Sunita Sharma"
                  rollNo="24"
                  admissionNo="ADM-2025-108"
                  className={previewCertSetup.classGrade || 'Class X'}
                  section={(previewCertSetup.config?.sections?.[0]) || 'Section A'}
                  dob="15/08/2010"
                  gender="Male"
                  studentPhoto=""
                  examName={previewCertSetup.exam}
                  session={previewCertSetup.session || '2025-2026'}
                  date={previewCertSetup.examDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  principalName={previewCertSetup.config?.schoolDetails?.principalName || 'Dr. S. K. Sharma'}
                  principalLabel="Principal & Director"
                  showSeal={true}
                  showQr={true}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold">
                Landscape A4 / Letter Print Ready • 300 DPI Vector Crest
              </span>
              <button
                type="button"
                onClick={() => setPreviewCertSetup(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

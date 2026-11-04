'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Filter,
  Download,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  Clock,
  Sparkles,
  TrendingUp,
  Percent,
  Check,
  Upload,
  Paperclip,
  ChevronRight,
  FileText,
  AlertCircle,
  HelpCircle,
  Sliders,
  RefreshCw,
  FolderPlus
} from 'lucide-react'
import { getInstituteAddedClasses } from '@/lib/institute-classes'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface Milestone {
  id: number
  unit?: string // e.g. "Unit 1", "Lesson 1", "Topic 1"
  lesson?: string // Lesson / Chapter title
  topic: string
  methodology?: string
  description?: string
  startDate: string
  endDate: string
  progress?: number
  completed?: boolean
}

export interface LessonPlanRecord {
  id: string | number
  className: string
  section: string
  title: string
  subject: string
  methodology: string
  description?: string
  date: string
  totalMilestones: number
  progress: number
  milestones?: Milestone[]
  attachmentName?: string
  createdAt: string
}

interface MasterClassItem {
  className: string
  sections?: string[]
}

interface MasterSectionItem {
  sectionName: string
  className: string
}

interface MasterSubjectItem {
  subjectName: string
  className: string
  groupName?: string
}

// ============================================================================
// HELPER NORMALIZERS FOR MASTER MATCHING
// ============================================================================
const normalizeClassStr = (val: string): string => {
  return (val || '').trim().toLowerCase().replace(/[\s\-_]+/g, '')
}

const checkClassMatch = (classA: string, classB: string): boolean => {
  if (!classA || !classB) return false
  const a = normalizeClassStr(classA)
  const b = normalizeClassStr(classB)
  if (a === b) return true

  // Roman numeral equivalences
  const roman: Record<string, string> = {
    class1: 'classi',
    class2: 'classii',
    class3: 'classiii',
    class4: 'classiv',
    class5: 'classv',
    class6: 'classvi',
    class7: 'classvii',
    class8: 'classviii',
    class9: 'classix',
    class10: 'classx',
    class11: 'classxi',
    class12: 'classxii'
  }
  if (roman[a] === b || roman[b] === a) return true
  return a.includes(b) || b.includes(a)
}

// Cascading helper: Get Sections for a specific Class from Masters
const getAvailableSectionsForClass = (
  className: string,
  allSections: MasterSectionItem[],
  allClasses: MasterClassItem[]
): string[] => {
  if (!className) return []
  const found = new Set<string>()

  // 1. From school_masters_sections
  allSections.forEach(s => {
    if (s.className && (checkClassMatch(s.className, className) || s.className.toLowerCase() === 'all')) {
      const name = s.sectionName.trim()
      const formatted = name.toLowerCase().startsWith('sec') ? name : `Section ${name}`
      found.add(formatted)
    }
  })

  // 2. From school_masters_classes sections array
  const matchedClass = allClasses.find(c => checkClassMatch(c.className, className))
  if (matchedClass && Array.isArray(matchedClass.sections)) {
    matchedClass.sections.forEach(s => {
      if (typeof s === 'string' && s.trim()) {
        const formatted = s.trim().toLowerCase().startsWith('sec') ? s.trim() : `Section ${s.trim()}`
        found.add(formatted)
      }
    })
  }

  // Fallback default sections if none configured in master
  if (found.size === 0) {
    return ['Section A', 'Section B', 'Section C']
  }

  return Array.from(found).sort()
}

// Cascading helper: Get Subjects for a specific Class from Masters
const getAvailableSubjectsForClass = (
  className: string,
  allSubjects: MasterSubjectItem[]
): string[] => {
  if (!className) {
    const set = new Set<string>()
    allSubjects.forEach(s => {
      if (s.subjectName?.trim()) set.add(s.subjectName.trim())
    })
    return Array.from(set).sort()
  }

  const classSpecific = new Set<string>()
  const generalSubjects = new Set<string>()

  allSubjects.forEach(s => {
    const sName = s.subjectName?.trim()
    if (!sName) return

    if (s.className && checkClassMatch(s.className, className)) {
      classSpecific.add(sName)
    } else if (!s.className || s.className.toLowerCase() === 'all' || s.className.toLowerCase() === 'general') {
      generalSubjects.add(sName)
    }
  })

  // If specific subjects found for this class, use them (plus any general)
  if (classSpecific.size > 0) {
    const merged = Array.from(new Set([...Array.from(classSpecific), ...Array.from(generalSubjects)]))
    return merged.sort()
  }

  // If none specific for this class, gather all master subjects
  if (allSubjects.length > 0) {
    const allUnique = new Set<string>()
    allSubjects.forEach(s => {
      if (s.subjectName?.trim()) allUnique.add(s.subjectName.trim())
    })
    if (allUnique.size > 0) return Array.from(allUnique).sort()
  }

  // Fallback default curriculum subjects
  return [
    'Mathematics',
    'Science',
    'English',
    'Social Studies',
    'Hindi',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Accountancy',
    'Economics',
    'Business Studies'
  ]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LessonPlansPage() {
  const [plans, setPlans] = useState<LessonPlanRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all')
  const [filterClass, setFilterClass] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')

  // Create & Edit Modal State (Single Page Modal Architecture)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | number | null>(null)
  const [formClass, setFormClass] = useState('')
  const [formSection, setFormSection] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formMethodology, setFormMethodology] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formProgress, setFormProgress] = useState<number>(0)
  const [formMilestones, setFormMilestones] = useState<Milestone[]>([
    {
      id: 1,
      unit: 'Lesson 1',
      lesson: '',
      topic: '',
      methodology: '',
      description: '',
      startDate: '',
      endDate: '',
      progress: 0,
      completed: false
    }
  ])
  const [formAttachmentName, setFormAttachmentName] = useState('')
  const [submittingForm, setSubmittingForm] = useState(false)

  // Quick Update Progress Modal State
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [progressPlan, setProgressPlan] = useState<LessonPlanRecord | null>(null)
  const [tempProgress, setTempProgress] = useState<number>(0)
  const [tempMilestones, setTempMilestones] = useState<Milestone[]>([])
  const [updatingProgress, setUpdatingProgress] = useState(false)

  // View Details Modal State
  const [viewPlan, setViewPlan] = useState<LessonPlanRecord | null>(null)

  // Delete Confirmation Modal State
  const [deletePlanId, setDeletePlanId] = useState<string | number | null>(null)

  // Master Lists fetched from Master
  const [masterClasses, setMasterClasses] = useState<MasterClassItem[]>([])
  const [masterSections, setMasterSections] = useState<MasterSectionItem[]>([])
  const [masterSubjects, setMasterSubjects] = useState<MasterSubjectItem[]>([])

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3500)
  }

  // ── Load Masters: Classes, Sections, Subjects ─────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Load classes from school_masters_classes
    let loadedClasses: MasterClassItem[] = []
    try {
      const rawCls = localStorage.getItem('school_masters_classes')
      if (rawCls) {
        const parsed = JSON.parse(rawCls)
        if (Array.isArray(parsed)) {
          loadedClasses = parsed
            .filter((c: any) => !c.deleted && (c.className || c.name))
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((c: any) => ({
              className: String(c.className || c.name).trim(),
              sections: Array.isArray(c.sections) ? c.sections : []
            }))
        }
      }
    } catch (e) {
      console.error('Error reading school_masters_classes:', e)
    }

    // Fallback to getInstituteAddedClasses if empty
    if (loadedClasses.length === 0) {
      try {
        const fallback = getInstituteAddedClasses()
        loadedClasses = fallback.map(f => ({ className: f.className, sections: f.sections }))
      } catch {}
    }
    setMasterClasses(loadedClasses)

    // 2. Load sections from school_masters_sections
    try {
      const rawSec = localStorage.getItem('school_masters_sections')
      if (rawSec) {
        const parsed = JSON.parse(rawSec)
        if (Array.isArray(parsed)) {
          const valid = parsed
            .filter((s: any) => !s.deleted && (s.sectionName || s.name))
            .map((s: any) => ({
              sectionName: String(s.sectionName || s.name).trim(),
              className: String(s.className || '').trim()
            }))
          setMasterSections(valid)
        }
      }
    } catch (e) {
      console.error('Error reading school_masters_sections:', e)
    }

    // 3. Load subjects from school_masters_subjects
    try {
      const rawSub = localStorage.getItem('school_masters_subjects')
      if (rawSub) {
        const parsed = JSON.parse(rawSub)
        if (Array.isArray(parsed)) {
          const valid = parsed
            .filter((s: any) => !s.deleted && (s.subjectName || s.name))
            .map((s: any) => ({
              subjectName: String(s.subjectName || s.name).trim(),
              className: String(s.className || '').trim(),
              groupName: s.groupName
            }))
          setMasterSubjects(valid)
        }
      }
    } catch (e) {
      console.error('Error reading school_masters_subjects:', e)
    }
  }, [])

  // Dynamic available sections for Form Class
  const availableFormSections = useMemo(() => {
    return getAvailableSectionsForClass(formClass, masterSections, masterClasses)
  }, [formClass, masterSections, masterClasses])

  // Dynamic available subjects for Form Class
  const availableFormSubjects = useMemo(() => {
    return getAvailableSubjectsForClass(formClass, masterSubjects)
  }, [formClass, masterSubjects])

  // Dynamic available sections for Filter Class
  const availableFilterSections = useMemo(() => {
    return getAvailableSectionsForClass(filterClass, masterSections, masterClasses)
  }, [filterClass, masterSections, masterClasses])

  // Dynamic available subjects for Filter Class
  const availableFilterSubjects = useMemo(() => {
    return getAvailableSubjectsForClass(filterClass, masterSubjects)
  }, [filterClass, masterSubjects])

  // Check URL query parameters for ?openCreate=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('openCreate') === 'true' || params.get('openAdd') === 'true') {
        handleOpenCreateModal()
      }
    }
  }, [])

  // Fetch lesson plans from backend API (with fallback to localStorage)
  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (filterClass) params.append('className', filterClass)
      if (filterSection) params.append('section', filterSection)
      if (filterSubject) params.append('subject', filterSubject)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const res = await fetch(`/api/institute/lesson-plans?${params.toString()}`)
      const json = await res.json()

      if (json.success && Array.isArray(json.data)) {
        setPlans(json.data)
        localStorage.setItem('school_lesson_plans', JSON.stringify(json.data))
      } else {
        const saved = localStorage.getItem('school_lesson_plans')
        if (saved) {
          try {
            setPlans(JSON.parse(saved))
          } catch {}
        }
      }
    } catch (err) {
      console.warn('API error, reading from localStorage:', err)
      const saved = localStorage.getItem('school_lesson_plans')
      if (saved) {
        try {
          setPlans(JSON.parse(saved))
        } catch {}
      }
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filterClass, filterSection, filterSubject, statusFilter])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  // ── Open Create Modal ─────────────────────────────────────────────────────
  // Defaults to "" so "Select Class", "Select Section", "Select Subject" appear
  const handleOpenCreateModal = () => {
    setEditingPlanId(null)
    setFormClass('')
    setFormSection('')
    setFormSubject('')
    setFormTitle('')
    setFormMethodology('Interactive Problem Solving & Lab Work')
    setFormDescription('')
    setFormProgress(0)
    setFormMilestones([
      {
        id: 1,
        unit: 'Lesson 1',
        lesson: '',
        topic: '',
        methodology: 'Interactive Problem Solving & Lab Work',
        startDate: '',
        endDate: '',
        progress: 0,
        completed: false,
        description: ''
      }
    ])
    setFormAttachmentName('')
    setFormModalOpen(true)
  }

  // ── Open Edit Modal ───────────────────────────────────────────────────────
  const handleOpenEditModal = (plan: LessonPlanRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingPlanId(plan.id)
    setFormClass(plan.className)
    setFormSection(plan.section)
    setFormSubject(plan.subject)
    setFormTitle(plan.title)
    setFormMethodology(plan.methodology)
    setFormDescription(plan.description || '')
    setFormProgress(plan.progress || 0)
    setFormAttachmentName(plan.attachmentName || '')

    if (plan.milestones && plan.milestones.length > 0) {
      setFormMilestones(
        plan.milestones.map((m, i) => {
          const cardProg = m.progress !== undefined ? m.progress : (m.completed ? 100 : 0)
          return {
            id: m.id || i + 1,
            unit: m.unit || `Lesson ${i + 1}`,
            lesson: m.lesson || m.topic || '',
            topic: m.topic || m.lesson || '',
            methodology: m.methodology || plan.methodology || '',
            startDate: m.startDate || '',
            endDate: m.endDate || '',
            progress: cardProg,
            completed: cardProg === 100,
            description: m.description || ''
          }
        })
      )
    } else {
      setFormMilestones([
        {
          id: 1,
          unit: 'Lesson 1',
          lesson: plan.title,
          topic: plan.title,
          methodology: plan.methodology,
          startDate: '',
          endDate: '',
          progress: plan.progress || 0,
          completed: (plan.progress || 0) === 100,
          description: plan.description || ''
        }
      ])
    }
    setFormModalOpen(true)
  }

  // ── Quick Update Progress Modal ───────────────────────────────────────────
  const handleOpenProgressModal = (plan: LessonPlanRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setProgressPlan(plan)
    setTempProgress(plan.progress || 0)
    setTempMilestones(
      plan.milestones && plan.milestones.length > 0
        ? plan.milestones.map((m, i) => ({
            id: m.id || i + 1,
            unit: m.unit || `Unit ${i + 1}`,
            topic: m.topic || '',
            methodology: m.methodology || '',
            startDate: m.startDate || '',
            endDate: m.endDate || '',
            completed: !!m.completed
          }))
        : [
            { id: 1, unit: 'Unit 1', topic: 'Fundamentals & Conceptual Overview', startDate: '', endDate: '', completed: (plan.progress || 0) >= 33 },
            { id: 2, unit: 'Unit 2', topic: 'Practice Sessions & Problem Exercises', startDate: '', endDate: '', completed: (plan.progress || 0) >= 66 },
            { id: 3, unit: 'Unit 3', topic: 'Evaluation, Assessments & Test Prep', startDate: '', endDate: '', completed: (plan.progress || 0) === 100 }
          ]
    )
    setProgressModalOpen(true)
  }

  // Save Progress from Quick Modal
  const handleSaveProgressModal = async () => {
    if (!progressPlan) return
    setUpdatingProgress(true)
    try {
      const res = await fetch(`/api/institute/lesson-plans/${progressPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress: tempProgress,
          milestones: tempMilestones
        })
      })
      const json = await res.json()
      if (json.success) {
        triggerToast(`Progress updated to ${tempProgress}%!`)
        setPlans(prev =>
          prev.map(p =>
            p.id === progressPlan.id ? { ...p, progress: tempProgress, milestones: tempMilestones } : p
          )
        )
        setProgressModalOpen(false)
        if (viewPlan && viewPlan.id === progressPlan.id) {
          setViewPlan({ ...viewPlan, progress: tempProgress, milestones: tempMilestones })
        }
      } else {
        alert(json.error || 'Failed to update progress')
      }
    } catch {
      // Offline fallback
      setPlans(prev =>
        prev.map(p =>
          p.id === progressPlan.id ? { ...p, progress: tempProgress, milestones: tempMilestones } : p
        )
      )
      triggerToast(`Progress updated to ${tempProgress}%!`)
      setProgressModalOpen(false)
    } finally {
      setUpdatingProgress(false)
    }
  }

  // ── Milestone / Lesson Card Helpers ─────────────────────────────
  const addFormMilestone = () => {
    const nextNum = formMilestones.length + 1
    const newCard: Milestone = {
      id: Date.now(),
      unit: `Lesson ${nextNum}`,
      lesson: '',
      topic: '',
      methodology: '',
      startDate: '',
      endDate: '',
      progress: 0,
      completed: false,
      description: ''
    }
    const updated = [...formMilestones, newCard]
    setFormMilestones(updated)
    const avg = Math.round(updated.reduce((acc, m) => acc + (m.progress || 0), 0) / updated.length)
    setFormProgress(avg)
  }

  const removeFormMilestone = (id: number) => {
    if (formMilestones.length <= 1) return
    const remaining = formMilestones.filter(m => m.id !== id)
    setFormMilestones(remaining)
    const avg = Math.round(remaining.reduce((acc, m) => acc + (m.progress || 0), 0) / remaining.length)
    setFormProgress(avg)
  }

  const updateFormMilestoneField = (id: number, field: keyof Milestone, val: any) => {
    setFormMilestones(prev =>
      prev.map(m => {
        if (m.id === id) {
          const updated = { ...m, [field]: val }
          if (field === 'topic') updated.lesson = val
          if (field === 'lesson') updated.topic = val
          return updated
        }
        return m
      })
    )
  }

  // Card Progress Bar Update + Auto-sync Overall Progress
  const updateFormMilestoneProgress = (id: number, progressVal: number) => {
    const valid = Math.min(100, Math.max(0, progressVal))
    setFormMilestones(prev => {
      const updated = prev.map(m =>
        m.id === id
          ? {
              ...m,
              progress: valid,
              completed: valid === 100
            }
          : m
      )
      const avg = Math.round(updated.reduce((acc, m) => acc + (m.progress || 0), 0) / updated.length)
      setFormProgress(avg)
      return updated
    })
  }

  // Toggle milestone completed
  const toggleFormMilestoneComplete = (id: number) => {
    setFormMilestones(prev => {
      const updated = prev.map(m => {
        if (m.id === id) {
          const isDone = !m.completed
          return {
            ...m,
            completed: isDone,
            progress: isDone ? 100 : 0
          }
        }
        return m
      })
      const avg = Math.round(updated.reduce((acc, m) => acc + (m.progress || 0), 0) / updated.length)
      setFormProgress(avg)
      return updated
    })
  }

  // Add more lesson / topic / unit in Quick Progress Modal
  const addTempMilestone = () => {
    const nextNum = tempMilestones.length + 1
    setTempMilestones([
      ...tempMilestones,
      {
        id: Date.now(),
        unit: `Unit ${nextNum}`,
        topic: `Unit ${nextNum} Curriculum Topics`,
        startDate: '',
        endDate: '',
        completed: false
      }
    ])
  }

  // Toggle milestone in quick progress popup
  const toggleTempMilestone = (id: number) => {
    const updated = tempMilestones.map(m => (m.id === id ? { ...m, completed: !m.completed } : m))
    setTempMilestones(updated)
    const done = updated.filter(m => m.completed).length
    const calc = Math.round((done / updated.length) * 100)
    setTempProgress(calc)
  }

  // ── Handle Form Submit (Create or Edit in Modal) ───────────────────────────
  const handleSavePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formClass) {
      alert('Please select a Class from master.')
      return
    }
    if (!formSection) {
      alert('Please select a Section.')
      return
    }

    const finalSubject = formSubject.trim()
    if (!finalSubject) {
      alert('Please select a Subject from master.')
      return
    }

    // Filter valid milestones / cards
    const validMilestones = formMilestones.filter(m => (m.lesson || m.topic || '').trim())
    if (validMilestones.length === 0) {
      alert('Please add at least one Lesson Card with a title.')
      return
    }

    const firstCardTitle = (validMilestones[0].lesson || validMilestones[0].topic || '').trim()
    const derivedTitle = formTitle.trim() || firstCardTitle || `${finalSubject} Lesson Plan`
    const derivedMethodology = formMethodology.trim() || validMilestones[0].methodology || 'Interactive Problem Solving & Lab Work'
    const derivedDescription = formDescription.trim() || validMilestones[0].description || ''

    setSubmittingForm(true)
    try {
      const payload = {
        className: formClass,
        section: formSection,
        title: derivedTitle,
        subject: finalSubject,
        methodology: derivedMethodology,
        description: derivedDescription,
        progress: formProgress,
        milestones: validMilestones.map(m => ({
          ...m,
          topic: m.topic || m.lesson || '',
          lesson: m.lesson || m.topic || '',
          completed: m.progress === 100
        })),
        attachmentName: formAttachmentName
      }

      const url = editingPlanId
        ? `/api/institute/lesson-plans/${editingPlanId}`
        : '/api/institute/lesson-plans'
      const method = editingPlanId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()

      if (json.success && json.data) {
        triggerToast(
          editingPlanId ? 'Lesson plan updated successfully!' : 'Lesson plan created successfully!'
        )
        setFormModalOpen(false)
        fetchPlans()
      } else {
        alert(json.error || 'Failed to save lesson plan.')
      }
    } catch (err: any) {
      console.error('Save error:', err)
      // LocalStorage fallback
      const newPlan: LessonPlanRecord = {
        id: editingPlanId || `offline-${Date.now()}`,
        className: formClass,
        section: formSection,
        title: formTitle.trim(),
        subject: finalSubject,
        methodology: formMethodology.trim() || 'Interactive Problem Solving & Lab Work',
        description: formDescription.trim(),
        date: new Date().toLocaleDateString('en-GB'),
        totalMilestones: validMilestones.length,
        progress: formProgress,
        milestones: validMilestones,
        attachmentName: formAttachmentName,
        createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }

      if (editingPlanId) {
        setPlans(prev => prev.map(p => (p.id === editingPlanId ? newPlan : p)))
      } else {
        setPlans(prev => [newPlan, ...prev])
      }
      triggerToast(
        editingPlanId ? 'Lesson plan updated successfully!' : 'Lesson plan created successfully!'
      )
      setFormModalOpen(false)
    } finally {
      setSubmittingForm(false)
    }
  }

  // ── Handle Delete Lesson Plan ─────────────────────────────────────────────
  const handleDeletePlan = async (id: string | number) => {
    try {
      const res = await fetch(`/api/institute/lesson-plans/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        triggerToast('Lesson plan deleted successfully!')
        setPlans(prev => prev.filter(p => p.id !== id))
      } else {
        alert(json.error || 'Failed to delete lesson plan.')
      }
    } catch {
      setPlans(prev => prev.filter(p => p.id !== id))
      triggerToast('Lesson plan deleted successfully!')
    } finally {
      setDeletePlanId(null)
      if (viewPlan && viewPlan.id === id) setViewPlan(null)
    }
  }

  // ── Export to CSV ─────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (plans.length === 0) {
      alert('No lesson plans available to export.')
      return
    }

    const headers = [
      'S.No.',
      'Class',
      'Section',
      'Lesson Title',
      'Subject',
      'Methodology',
      'Date',
      'Milestones',
      'Progress (%)',
      'Created At'
    ]
    const rows = plans.map((p, i) => [
      i + 1,
      `"${p.className}"`,
      `"${p.section}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.subject}"`,
      `"${p.methodology.replace(/"/g, '""')}"`,
      `"${p.date}"`,
      p.totalMilestones,
      `${p.progress}%`,
      `"${p.createdAt}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Lesson_Plans_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Lesson plans exported to CSV!')
  }

  // Clear filters
  const handleClearFilters = () => {
    setFilterClass('')
    setFilterSection('')
    setFilterSubject('')
    setFilterFromDate('')
    setFilterToDate('')
    setStatusFilter('all')
    setSearchQuery('')
    setFilterOpen(false)
  }

  // Filtered plans list
  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = p.title.toLowerCase().includes(q)
        const matchSubject = p.subject.toLowerCase().includes(q)
        const matchMethod = p.methodology.toLowerCase().includes(q)
        const matchClass = p.className.toLowerCase().includes(q)
        if (!matchTitle && !matchSubject && !matchMethod && !matchClass) return false
      }
      if (filterClass && p.className !== filterClass) return false
      if (filterSection && p.section !== filterSection) return false
      if (filterSubject && p.subject !== filterSubject) return false
      if (statusFilter === 'completed' && p.progress < 100) return false
      if (statusFilter === 'in_progress' && (p.progress <= 0 || p.progress >= 100)) return false
      if (statusFilter === 'not_started' && p.progress !== 0) return false
      return true
    })
  }, [plans, searchQuery, filterClass, filterSection, filterSubject, statusFilter])

  // Count active filters
  const activeFiltersCount = [
    filterClass,
    filterSection,
    filterSubject,
    filterFromDate,
    filterToDate,
    statusFilter !== 'all' ? statusFilter : ''
  ].filter(Boolean).length

  // Stats calculations
  const totalCount = plans.length
  const completedCount = plans.filter(p => p.progress >= 100).length
  const inProgressCount = plans.filter(p => p.progress > 0 && p.progress < 100).length
  const avgProgress = totalCount > 0 ? Math.round(plans.reduce((acc, p) => acc + (p.progress || 0), 0) / totalCount) : 0

  // Progress color helper
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-emerald-500'
    if (percent >= 60) return 'bg-teal-500'
    if (percent >= 30) return 'bg-blue-500'
    if (percent > 0) return 'bg-amber-500'
    return 'bg-slate-300'
  }

  const getProgressBadgeStyle = (percent: number) => {
    if (percent >= 100) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (percent >= 60) return 'bg-teal-50 text-teal-700 border-teal-200'
    if (percent >= 30) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (percent > 0) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-slate-50 text-slate-500 border-slate-200'
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight flex items-center gap-2">
            <span>Lesson Plan Management</span>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Interactive Modals
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure syllabus milestones, track real-time progress percentages, and manage curricula seamlessly.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, subject, methodology..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-500 w-64 bg-white shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Modal Trigger */}
          <button
            onClick={() => setFilterOpen(true)}
            className={`p-2 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer relative ${
              activeFiltersCount > 0
                ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
            title="Advanced Filters"
          >
            <Filter className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-600 text-white rounded-full text-[9px] flex items-center justify-center font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Primary Action: Add Lesson Plan in Modal */}
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lesson Plan</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Plans</span>
            <BookOpen className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-slate-850">{totalCount}</div>
          <p className="text-[10px] text-slate-400 font-semibold">Active curriculums</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-600">{inProgressCount}</div>
          <p className="text-[10px] text-slate-400 font-semibold">Under active teaching</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600">{completedCount}</div>
          <p className="text-[10px] text-slate-400 font-semibold">100% syllabus achieved</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg. Progress</span>
            <Percent className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-700">{avgProgress}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full transition-all" style={{ width: `${avgProgress}%` }} />
          </div>
        </div>
      </div>

      {/* 3. Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { key: 'all', label: `All Plans (${totalCount})` },
          { key: 'in_progress', label: `In Progress (${inProgressCount})` },
          { key: 'completed', label: `Completed 100% (${completedCount})` },
          { key: 'not_started', label: `Not Started (0%) (${plans.filter(p => (p.progress || 0) === 0).length})` }
        ].map(chip => {
          const isActive = statusFilter === chip.key
          return (
            <button
              key={chip.key}
              onClick={() => setStatusFilter(chip.key as any)}
              className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {/* 4. Lesson Plans Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50/80 font-black text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-3 py-4 w-12">S. No.</th>
                <th className="px-3 py-4 w-24">Class</th>
                <th className="px-3 py-4 w-24">Section</th>
                <th className="px-3 py-4 text-left min-w-[180px]">Lesson Title</th>
                <th className="px-3 py-4 w-28">Subject</th>
                <th className="px-3 py-4 text-left min-w-[160px]">Methodology</th>
                <th className="px-3 py-4 w-24">Date</th>
                <th className="px-3 py-4 w-32">Lessons / Topics</th>
                <th className="px-3 py-4 min-w-[170px] text-left">Progress (%)</th>
                <th className="px-3 py-4 w-32">Created At</th>
                <th className="px-3 py-4 w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-slate-500">Loading lesson plans...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="text-slate-700 font-bold text-sm">No lesson plans found</span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchQuery || activeFiltersCount > 0 || statusFilter !== 'all'
                          ? 'No plans match your current filters. Try resetting search filters.'
                          : 'You have not added any lesson plans yet. Click below to create your first teaching plan in popup.'}
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lesson Plan</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((item, idx) => {
                  const percent = Math.min(100, Math.max(0, item.progress || 0))
                  const totalM = item.milestones?.length || item.totalMilestones || 1
                  const completedM = item.milestones
                    ? item.milestones.filter(m => m.completed).length
                    : Math.round((percent / 100) * totalM)

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors align-middle cursor-pointer"
                      onClick={() => setViewPlan(item)}
                    >
                      <td className="px-3 py-4 text-slate-400 font-bold">{idx + 1}.</td>

                      {/* Class */}
                      <td className="px-3 py-4 text-slate-700 font-bold whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.className}
                        </span>
                      </td>

                      {/* Section */}
                      <td className="px-3 py-4 text-slate-600 font-bold whitespace-nowrap">
                        {item.section}
                      </td>

                      {/* Title */}
                      <td className="px-3 py-4 text-left">
                        <div className="font-black text-slate-850 text-sm">{item.title}</div>
                        {item.description && (
                          <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </td>

                      {/* Subject */}
                      <td className="px-3 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {item.subject}
                        </span>
                      </td>

                      {/* Methodology */}
                      <td className="px-3 py-4 text-left text-slate-600 text-[11px] font-medium leading-relaxed">
                        <span className="line-clamp-2">{item.methodology}</span>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-4 text-slate-500 font-semibold whitespace-nowrap text-[11px]">
                        {item.date}
                      </td>

                      {/* Total Lessons / Topics / Units */}
                      <td className="px-3 py-4 text-slate-700 font-bold">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                          {totalM} Units / Topics
                        </span>
                      </td>

                      {/* PROGRESS IN PERCENTAGE (Clickable to Quick Update!) */}
                      <td className="px-3 py-4 text-left" onClick={e => handleOpenProgressModal(item, e)}>
                        <div className="flex flex-col gap-1.5 min-w-[130px] group/prog">
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`px-2 py-0.2 rounded-md font-black text-[11px] border shadow-2xs ${getProgressBadgeStyle(
                                percent
                              )}`}
                            >
                              {percent}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold group-hover/prog:text-teal-600 flex items-center gap-0.5">
                              <span>
                                {completedM}/{totalM} Done
                              </span>
                              <Sliders className="w-2.5 h-2.5 opacity-0 group-hover/prog:opacity-100 transition-opacity" />
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80 p-0.2">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${getProgressColor(
                                percent
                              )}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="px-3 py-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {item.createdAt}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Progress Update Button */}
                          <button
                            onClick={e => handleOpenProgressModal(item, e)}
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Quick Update Progress"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          {/* View */}
                          <button
                            onClick={() => setViewPlan(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Plan Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit in Modal */}
                          <button
                            onClick={e => handleOpenEditModal(item, e)}
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Lesson Plan"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletePlanId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Lesson Plan"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* ========================================================= */}
      {/* 5. CREATE & EDIT LESSON PLAN MODAL                        */}
      {/* ========================================================= */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 md:p-8 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-850">
                    {editingPlanId ? 'Edit Teaching Lesson Plan' : 'Create Teaching Lesson Plan'}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Select Class, Section, and Subject from master, add multiple lessons/units, and track syllabus progress.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePlanSubmit} className="space-y-6">
              {/* SECTION 1: Class, Section, Subject & Overall Progress */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50/70 via-slate-50 to-white border border-teal-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-teal-600" />
                    <span>Class, Section, Subject & Overall Progress</span>
                  </h3>
                  <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    Synced with Lesson Cards
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Class Dropdown */}
                  <div>
                    <label className="text-slate-700 font-bold block mb-1 text-xs">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formClass}
                      onChange={e => {
                        const newClass = e.target.value
                        setFormClass(newClass)
                        // Reset section & subject cascadingly
                        setFormSection('')
                        setFormSubject('')
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs cursor-pointer focus:border-teal-500 shadow-2xs"
                    >
                      <option value="">-- Select Class --</option>
                      {masterClasses.map(c => (
                        <option key={c.className} value={c.className}>
                          {c.className}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section Dropdown (Filtered by Class) */}
                  <div>
                    <label className="text-slate-700 font-bold block mb-1 text-xs">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={!formClass}
                      value={formSection}
                      onChange={e => setFormSection(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs cursor-pointer focus:border-teal-500 shadow-2xs disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {!formClass ? (
                        <option value="">-- Select Class First --</option>
                      ) : (
                        <>
                          <option value="">-- Select Section --</option>
                          {availableFormSections.map(s => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  {/* Subject Dropdown (Filtered by Class from Master) */}
                  <div>
                    <label className="text-slate-700 font-bold block mb-1 text-xs">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={!formClass}
                      value={formSubject}
                      onChange={e => setFormSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs cursor-pointer focus:border-teal-500 shadow-2xs disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {!formClass ? (
                        <option value="">-- Select Class First --</option>
                      ) : (
                        <>
                          <option value="">-- Select Subject --</option>
                          {availableFormSubjects.map(sub => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                          {formSubject && !availableFormSubjects.includes(formSubject) && (
                            <option value={formSubject}>{formSubject}</option>
                          )}
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* OVERALL PROGRESS */}
                <div className="pt-3 border-t border-teal-100/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-black text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-teal-600" />
                        <span>Overall Progress:</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        (Average of {formMilestones.length} Lesson {formMilestones.length === 1 ? 'Card' : 'Cards'})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-teal-800 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                        {formProgress}%
                      </span>
                    </div>
                  </div>

                  {/* Single Minimal Progress Slider */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={formProgress}
                      onChange={e => setFormProgress(parseInt(e.target.value) || 0)}
                      className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      {[0, 25, 50, 75, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormProgress(val)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black border transition cursor-pointer ${
                            formProgress === val
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-white text-teal-800 border-teal-200 hover:bg-teal-50'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CARD TYPE ADD MORE (LESSON, METHODOLOGY, DESCRIPTION, START DATE, END DATE, PROGRESS BAR) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-teal-600" />
                      <span>Lesson Cards ({formMilestones.length})</span>
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Add and manage each lesson with its methodology, description, dates, and individual progress bar.
                    </p>
                  </div>

                  {/* Top Add More Button */}
                  <button
                    type="button"
                    onClick={addFormMilestone}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-xs shadow-teal-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add More Card</span>
                  </button>
                </div>

                {/* List of Lesson Cards */}
                <div className="space-y-4">
                  {formMilestones.map((m, idx) => {
                    const cardProgress = m.progress || 0
                    return (
                      <div
                        key={m.id}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-300 shadow-xs hover:shadow-md transition-all space-y-3.5 relative"
                      >
                        {/* Card Header: Card # + Progress Badge + Delete */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-black text-xs border border-teal-200">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-black text-slate-800">
                              Lesson Card {idx + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {/* Card Progress Badge */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black border ${getProgressBadgeStyle(cardProgress)}`}>
                              {cardProgress}% Complete
                            </span>

                            {/* Remove Card Button */}
                            {formMilestones.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFormMilestone(m.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove this lesson card"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Card Fields */}
                        <div className="space-y-3">
                          {/* 1. Lesson Title & Teaching Methodology */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="text-[11px] text-slate-700 font-bold block mb-1">
                                Lesson / Chapter Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Chapter 1: Introduction & Formulae"
                                value={m.lesson || m.topic || ''}
                                onChange={e => {
                                  updateFormMilestoneField(m.id, 'lesson', e.target.value)
                                  updateFormMilestoneField(m.id, 'topic', e.target.value)
                                }}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-700 font-bold block mb-1">
                                Teaching Methodology
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Interactive Problem Solving, Lab Work, Lecture"
                                value={m.methodology || ''}
                                onChange={e => updateFormMilestoneField(m.id, 'methodology', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                              />
                            </div>
                          </div>

                          {/* 2. Description */}
                          <div>
                            <label className="text-[11px] text-slate-700 font-bold block mb-1">
                              Description & Key Objectives
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Write lesson curriculum breakdown, notes, and key learning concepts..."
                              value={m.description || ''}
                              onChange={e => updateFormMilestoneField(m.id, 'description', e.target.value)}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-xs text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-none transition leading-relaxed"
                            />
                          </div>

                          {/* 3. Start Date, End Date & Progress Bar */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            {/* Start Date */}
                            <div className="sm:col-span-3">
                              <label className="text-[10.5px] text-slate-500 font-bold block mb-1 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Start Date</span>
                              </label>
                              <input
                                type="date"
                                value={m.startDate || ''}
                                onChange={e => updateFormMilestoneField(m.id, 'startDate', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl outline-none font-bold text-xs bg-slate-50 text-slate-700 focus:bg-white focus:border-teal-500"
                              />
                            </div>

                            {/* End Date */}
                            <div className="sm:col-span-3">
                              <label className="text-[10.5px] text-slate-500 font-bold block mb-1 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>End Date</span>
                              </label>
                              <input
                                type="date"
                                value={m.endDate || ''}
                                onChange={e => updateFormMilestoneField(m.id, 'endDate', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl outline-none font-bold text-xs bg-slate-50 text-slate-700 focus:bg-white focus:border-teal-500"
                              />
                            </div>

                            {/* Progress Bar inside Card */}
                            <div className="sm:col-span-6 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span className="flex items-center gap-1 text-[11px]">
                                  <Percent className="w-3 h-3 text-teal-600" />
                                  <span>Progress:</span>
                                </span>
                                <span className="font-black text-teal-700 text-xs">
                                  {cardProgress}%
                                </span>
                              </div>

                              {/* Single Minimal Slider */}
                              <div className="flex items-center gap-2 pt-0.5">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={cardProgress}
                                  onChange={e => updateFormMilestoneProgress(m.id, parseInt(e.target.value) || 0)}
                                  className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                                />
                                <div className="flex gap-1 shrink-0">
                                  {[0, 50, 100].map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => updateFormMilestoneProgress(m.id, v)}
                                      className={`px-1.5 py-0.5 text-[9px] font-black rounded border transition cursor-pointer ${
                                        cardProgress === v
                                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      {v}%
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Big Bottom Add More Card Button */}
                <button
                  type="button"
                  onClick={addFormMilestone}
                  className="w-full py-3 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50 text-teal-700 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  <span>+ Add More Lesson Card</span>
                </button>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center gap-2 text-xs disabled:opacity-50"
                >
                  {submittingForm ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Plan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingPlanId ? 'Update Lesson Plan' : 'Save Lesson Plan'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. QUICK UPDATE PROGRESS MODAL                            */}
      {/* ========================================================= */}
      {progressModalOpen && progressPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative space-y-5">
            <button
              onClick={() => setProgressModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {progressPlan.subject}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                  {progressPlan.className} • {progressPlan.section}
                </span>
              </div>
              <h2 className="text-sm font-black text-slate-850 mt-1">{progressPlan.title}</h2>
              <p className="text-[11px] text-slate-400">
                Adjust progress slider or mark lessons/units completed to update progress in percentage.
              </p>
            </div>

            {/* Big Progress Gauge */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-3xl font-black text-teal-800">{tempProgress}</span>
                <span className="text-lg font-black text-teal-600">%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-teal-200 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getProgressColor(
                    tempProgress
                  )}`}
                  style={{ width: `${tempProgress}%` }}
                />
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={tempProgress}
                onChange={e => setTempProgress(parseInt(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />

              {/* Quick Presets */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {[0, 25, 50, 75, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTempProgress(val)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                      tempProgress === val
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-teal-800 border-teal-200 hover:bg-teal-50'
                    }`}
                  >
                    {val === 100 ? '100% (Done)' : `${val}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Lessons / Units Checklist in Progress Modal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  Lessons / Topics Checklist ({tempMilestones.length})
                </label>
                <button
                  type="button"
                  onClick={addTempMilestone}
                  className="text-[11px] text-teal-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Unit</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {tempMilestones.map((m, idx) => (
                  <label
                    key={m.id || idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      m.completed
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <input
                        type="checkbox"
                        checked={!!m.completed}
                        onChange={() => toggleTempMilestone(m.id)}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {m.unit || `#${idx + 1}`}
                      </span>
                      <span
                        className={`text-xs font-semibold truncate ${
                          m.completed ? 'line-through text-emerald-700' : ''
                        }`}
                      >
                        {m.topic}
                      </span>
                    </div>
                    {m.completed && (
                      <span className="text-[10px] font-black text-emerald-600 whitespace-nowrap">
                        ✓ Done
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProgressModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingProgress}
                onClick={handleSaveProgressModal}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {updatingProgress ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Progress</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. VIEW PLAN DETAILS MODAL                                */}
      {/* ========================================================= */}
      {viewPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 md:p-8 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative space-y-5">
            <button
              onClick={() => setViewPlan(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200">
                  {viewPlan.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {viewPlan.className} • {viewPlan.section}
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900 mt-2">{viewPlan.title}</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Methodology: {viewPlan.methodology}</p>
            </div>

            {/* Progress Card in View Modal */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 text-xs">Teaching Progress</span>
                <span className="text-lg font-black text-teal-800">{viewPlan.progress || 0}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-teal-200 p-0.2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                    viewPlan.progress || 0
                  )}`}
                  style={{ width: `${viewPlan.progress || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-teal-700 font-semibold pt-1">
                <span>
                  Lessons / Topics:{' '}
                  {viewPlan.milestones?.length || viewPlan.totalMilestones} (
                  {viewPlan.milestones?.filter(m => m.completed).length || 0} completed)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setViewPlan(null)
                    handleOpenProgressModal(viewPlan)
                  }}
                  className="font-bold text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Update Progress</span>
                </button>
              </div>
            </div>

            {/* Description */}
            {viewPlan.description && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Description & Objectives
                </span>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium leading-relaxed max-h-36 overflow-y-auto">
                  {viewPlan.description}
                </div>
              </div>
            )}

            {/* Lessons / Topics Breakdown List */}
            {viewPlan.milestones && viewPlan.milestones.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Lessons, Topics & Units Breakdown ({viewPlan.milestones.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {viewPlan.milestones.map((m, i) => (
                    <div
                      key={m.id || i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              m.completed ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                            {m.unit || `Unit ${i + 1}`}
                          </span>
                          <span
                            className={`truncate font-semibold ${
                              m.completed ? 'text-emerald-800 line-through' : 'text-slate-800'
                            }`}
                          >
                            {m.topic}
                          </span>
                        </div>
                        {m.completed ? (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                            Completed
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Pending</span>
                        )}
                      </div>

                      {/* Methodology and Dates */}
                      {(m.methodology || m.startDate || m.endDate) && (
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          {m.methodology ? <span>Method: {m.methodology}</span> : <span />}
                          {(m.startDate || m.endDate) && (
                            <span>
                              {m.startDate} {m.endDate ? `to ${m.endDate}` : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const toEdit = viewPlan
                  setViewPlan(null)
                  handleOpenEditModal(toEdit)
                }}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Full Plan</span>
              </button>

              <button
                type="button"
                onClick={() => setViewPlan(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-xs cursor-pointer hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. FILTER MODAL                                           */}
      {/* ========================================================= */}
      {filterOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 text-xs font-semibold text-slate-700 space-y-5 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setFilterOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Filter Lesson Plans</h3>
                <p className="text-[11px] text-slate-400">
                  Select criteria from Master to narrow down lesson plans.
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Filter Class */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">Class</label>
                <select
                  value={filterClass}
                  onChange={e => {
                    setFilterClass(e.target.value)
                    setFilterSection('')
                    setFilterSubject('')
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs cursor-pointer"
                >
                  <option value="">All Classes</option>
                  {masterClasses.map(c => (
                    <option key={c.className} value={c.className}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Section */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">Section</label>
                <select
                  value={filterSection}
                  onChange={e => setFilterSection(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs cursor-pointer"
                >
                  <option value="">All Sections</option>
                  {availableFilterSections.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Subject */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">Subject</label>
                <select
                  value={filterSubject}
                  onChange={e => setFilterSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs cursor-pointer"
                >
                  <option value="">All Subjects</option>
                  {availableFilterSubjects.map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setFilterOpen(false)
                  fetchPlans()
                }}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                Apply Filter
              </button>
              <button
                onClick={handleClearFilters}
                className="px-8 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors bg-white cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. DELETE CONFIRMATION MODAL                              */}
      {/* ========================================================= */}
      {deletePlanId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Delete Lesson Plan?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete this lesson plan? All lesson, topic, and unit records will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletePlanId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlan(deletePlanId)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

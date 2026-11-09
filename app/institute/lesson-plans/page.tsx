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
  FolderPlus,
  Folder,
  ArrowLeft,
  List,
  ExternalLink,
  ChevronDown
} from 'lucide-react'
import { getInstituteAddedClasses, MasterClassWithSections, normalizeClassName, normalizeSectionName } from '@/lib/institute-classes'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface Milestone {
  id: number
  unit?: string
  lesson?: string
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
  chapterFolder?: string
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

export interface ChapterFolder {
  id: string
  className: string
  section: string
  subject: string
  lessonName: string
  lessonNumber?: string
  description?: string
  color?: string
  createdAt?: string
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
// Helper to normalize and match section strings (e.g. 'A' vs 'Section A')
const checkSectionMatch = (secA: string, secB: string): boolean => {
  if (!secA || !secB) return false
  const a = secA.toLowerCase().trim().replace(/^section\s*/i, '')
  const b = secB.toLowerCase().trim().replace(/^section\s*/i, '')
  return a === b
}

const checkClassMatch = (classA: string, classB: string): boolean => {
  if (!classA || !classB) return false
  const a = normalizeClassName(classA).toLowerCase().trim()
  const b = normalizeClassName(classB).toLowerCase().trim()
  if (a === b) return true
  const numA = a.replace(/[^0-9]/g, '')
  const numB = b.replace(/[^0-9]/g, '')
  if (numA && numB && numA === numB && !a.includes('-') && !b.includes('-')) return true
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

  allSections.forEach(s => {
    if (s.className && (checkClassMatch(s.className, className) || s.className.toLowerCase() === 'all')) {
      const name = s.sectionName.trim()
      const formatted = name.toLowerCase().startsWith('sec') ? name : `Section ${name}`
      found.add(formatted)
    }
  })

  const matchedClass = allClasses.find(c => checkClassMatch(c.className, className))
  if (matchedClass && Array.isArray(matchedClass.sections)) {
    matchedClass.sections.forEach(s => {
      if (typeof s === 'string' && s.trim()) {
        const formatted = s.trim().toLowerCase().startsWith('sec') ? s.trim() : `Section ${s.trim()}`
        found.add(formatted)
      }
    })
  }

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

  if (classSpecific.size > 0) {
    return Array.from(new Set([...Array.from(classSpecific), ...Array.from(generalSubjects)])).sort()
  }

  if (allSubjects.length > 0) {
    const allUnique = new Set<string>()
    allSubjects.forEach(s => {
      if (s.subjectName?.trim()) allUnique.add(s.subjectName.trim())
    })
    if (allUnique.size > 0) return Array.from(allUnique).sort()
  }

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
  // ── Top Level View Mode: 'folders' vs 'all-plans' ──
  const [viewMode, setViewMode] = useState<'folders' | 'all-plans'>('folders')

  // ── Hierarchical Drill-Down State: Class -> Section -> Subject -> Chapter -> Content ──
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)

  // Current drill-down level
  const currentLevel: 'classes' | 'sections' | 'subjects' | 'chapters' | 'content' = useMemo(() => {
    if (!selectedClass) return 'classes'
    if (!selectedSection) return 'sections'
    if (!selectedSubject) return 'subjects'
    if (!selectedChapter) return 'chapters'
    return 'content'
  }, [selectedClass, selectedSection, selectedSubject, selectedChapter])

  // Data State
  const [plans, setPlans] = useState<LessonPlanRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Chapter Folders State
  const [chapterFolders, setChapterFolders] = useState<ChapterFolder[]>([])
  const [loadingChapters, setLoadingChapters] = useState(false)
  const [chapterSearch, setChapterSearch] = useState('')

  // Search & Filters on drill-down levels
  const [classSearch, setClassSearch] = useState('')
  const [subjectSearch, setSubjectSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all')

  // Filter Dropdowns for All Plans View
  const [filterClass, setFilterClass] = useState('all')
  const [filterSection, setFilterSection] = useState('all')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterChapter, setFilterChapter] = useState('all')

  // Create / Edit Chapter Folder Modal State
  const [chapterModalOpen, setChapterModalOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<ChapterFolder | null>(null)
  const [chapterFormClass, setChapterFormClass] = useState('')
  const [chapterFormSection, setChapterFormSection] = useState('')
  const [chapterFormSubject, setChapterFormSubject] = useState('')
  const [chapterFormName, setChapterFormName] = useState('')
  const [chapterFormNumber, setChapterFormNumber] = useState('')
  const [chapterFormDesc, setChapterFormDesc] = useState('')
  const [chapterFormColor, setChapterFormColor] = useState('teal')
  const [submittingChapter, setSubmittingChapter] = useState(false)
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null)

  // Create & Edit Lesson Plan Modal State
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | number | null>(null)
  const [formClass, setFormClass] = useState('')
  const [formSection, setFormSection] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formChapter, setFormChapter] = useState('')
  const [formNewChapterMode, setFormNewChapterMode] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formMethodology, setFormMethodology] = useState('Interactive Problem Solving & Lab Work')
  const [formDescription, setFormDescription] = useState('')
  const [formProgress, setFormProgress] = useState<number>(0)
  const [formMilestones, setFormMilestones] = useState<Milestone[]>([
    {
      id: 1,
      unit: 'Topic 1',
      lesson: '',
      topic: '',
      methodology: 'Interactive Problem Solving & Lab Work',
      description: '',
      startDate: '',
      endDate: '',
      progress: 0,
      completed: false
    }
  ])
  const [formAttachmentName, setFormAttachmentName] = useState('')
  const [submittingForm, setSubmittingForm] = useState(false)
  const [formError, setFormError] = useState('')

  // Quick Progress Modal
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

  // ── 1. Load Master Data from localStorage / Defaults ───────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Classes
    let loadedClasses: MasterClassItem[] = []
    try {
      const rawCls = localStorage.getItem('school_masters_classes')
      if (rawCls) {
        const parsed = JSON.parse(rawCls)
        if (Array.isArray(parsed)) {
          const map = new Map<string, MasterClassItem>()
          parsed
            .filter((c: any) => !c.deleted && (c.className || c.name))
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .forEach((c: any) => {
              const canonical = normalizeClassName(String(c.className || c.name).trim())
              const key = canonical.toLowerCase()
              const secs = Array.isArray(c.sections) ? c.sections : []
              if (!map.has(key)) {
                map.set(key, { className: canonical, sections: secs })
              } else {
                const ex = map.get(key)!
                ex.sections = Array.from(new Set([...(ex.sections || []), ...secs]))
              }
            })
          loadedClasses = Array.from(map.values())
        }
      }
    } catch (e) {
      console.error(e)
    }

    if (loadedClasses.length === 0) {
      try {
        const fallback = getInstituteAddedClasses()
        loadedClasses = fallback.map(f => ({ className: normalizeClassName(f.className), sections: f.sections }))
      } catch {}
    }
    setMasterClasses(loadedClasses)

    // Sections
    try {
      const rawSec = localStorage.getItem('school_masters_sections')
      if (rawSec) {
        const parsed = JSON.parse(rawSec)
        if (Array.isArray(parsed)) {
          setMasterSections(
            parsed
              .filter((s: any) => !s.deleted && (s.sectionName || s.name))
              .map((s: any) => ({
                sectionName: String(s.sectionName || s.name).trim(),
                className: String(s.className || '').trim()
              }))
          )
        }
      }
    } catch (e) {}

    // Subjects
    try {
      const rawSub = localStorage.getItem('school_masters_subjects')
      if (rawSub) {
        const parsed = JSON.parse(rawSub)
        if (Array.isArray(parsed)) {
          setMasterSubjects(
            parsed
              .filter((s: any) => !s.deleted && (s.subjectName || s.name))
              .map((s: any) => ({
                subjectName: String(s.subjectName || s.name).trim(),
                className: String(s.className || '').trim(),
                groupName: s.groupName
              }))
          )
        }
      }
    } catch (e) {}
  }, [])

  // ── 2. Fetch Lesson Plans ──────────────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/institute/lesson-plans')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setPlans(json.data)
        localStorage.setItem('school_lesson_plans', JSON.stringify(json.data))
      } else {
        const saved = localStorage.getItem('school_lesson_plans')
        if (saved) setPlans(JSON.parse(saved))
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
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  // ── 3. Fetch Chapter Folders ───────────────────────────────────────────────
  const fetchChapters = useCallback(async () => {
    setLoadingChapters(true)
    try {
      const res = await fetch('/api/institute/study-materials/lessons')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setChapterFolders(json.data)
      }
    } catch (err) {
      console.warn('Error fetching chapters:', err)
    } finally {
      setLoadingChapters(false)
    }
  }, [])

  useEffect(() => {
    fetchChapters()
  }, [fetchChapters])

  // Check URL query parameters for ?openCreate=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('openCreate') === 'true' || params.get('openAdd') === 'true') {
        openAddPlanModal()
      }
    }
  }, [])

  // ── 4. Unified Classes List (Deduplicated with Roman Normalization) ─────────
  const unifiedClasses = useMemo(() => {
    const map = new Map<string, MasterClassItem>()

    // 1. Master classes
    masterClasses.forEach(c => {
      const canonical = normalizeClassName(c.className)
      const key = canonical.toLowerCase().trim()
      if (!map.has(key)) {
        map.set(key, {
          className: canonical,
          sections: Array.isArray(c.sections) ? [...c.sections] : []
        })
      } else {
        const ex = map.get(key)!
        if (Array.isArray(c.sections)) {
          c.sections.forEach(s => {
            if (s && !ex.sections?.includes(s)) ex.sections = [...(ex.sections || []), s]
          })
        }
      }
    })

    // 2. From plans
    plans.forEach(p => {
      if (p.className) {
        const canonical = normalizeClassName(p.className)
        const key = canonical.toLowerCase().trim()
        if (map.has(key)) {
          const ex = map.get(key)!
          if (p.section && !ex.sections?.includes(p.section)) {
            ex.sections = [...(ex.sections || []), p.section]
          }
        } else {
          map.set(key, {
            className: canonical,
            sections: [p.section].filter(Boolean)
          })
        }
      }
    })

    // 3. From chapters
    chapterFolders.forEach(ch => {
      if (ch.className) {
        const canonical = normalizeClassName(ch.className)
        const key = canonical.toLowerCase().trim()
        if (map.has(key)) {
          const ex = map.get(key)!
          if (ch.section && !ex.sections?.includes(ch.section)) {
            ex.sections = [...(ex.sections || []), ch.section]
          }
        } else {
          map.set(key, {
            className: canonical,
            sections: [ch.section].filter(Boolean)
          })
        }
      }
    })

    // Sort naturally: Class 1, Class 2, Class 3...
    return Array.from(map.values()).sort((a, b) => {
      const numA = parseInt(a.className.replace(/\D/g, ''), 10)
      const numB = parseInt(b.className.replace(/\D/g, ''), 10)
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB
      return a.className.localeCompare(b.className, undefined, { numeric: true, sensitivity: 'base' })
    })
  }, [masterClasses, plans, chapterFolders])

  // Filtered classes by search
  const filteredClasses = useMemo(() => {
    if (!classSearch.trim()) return unifiedClasses
    return unifiedClasses.filter(c => c.className.toLowerCase().includes(classSearch.toLowerCase().trim()))
  }, [unifiedClasses, classSearch])

  // Available Sections for selected Class
  const availableSections = useMemo(() => {
    if (!selectedClass) return []
    return getAvailableSectionsForClass(selectedClass, masterSections, unifiedClasses)
  }, [selectedClass, masterSections, unifiedClasses])

  // Available Subjects for selected Class
  const availableSubjects = useMemo(() => {
    if (!selectedClass) return []
    return getAvailableSubjectsForClass(selectedClass, masterSubjects)
  }, [selectedClass, masterSubjects])

  // Filtered subjects by search
  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return availableSubjects
    return availableSubjects.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase().trim()))
  }, [availableSubjects, subjectSearch])

  // ── Helper: Get Chapters for a specific Class, Section & Subject ──────────
  const getSubjectChapters = useCallback((cls: string, sec: string, sub: string): ChapterFolder[] => {
    const map = new Map<string, ChapterFolder>()

    // 1. From database chapterFolders
    chapterFolders.forEach(ch => {
      if (
        checkClassMatch(ch.className, cls) &&
        checkSectionMatch(ch.section, sec) &&
        ch.subject.toLowerCase().trim() === sub.toLowerCase().trim()
      ) {
        const key = ch.lessonName.toLowerCase().trim()
        map.set(key, ch)
      }
    })

    // 2. From plans that have a chapterFolder
    plans.forEach(p => {
      if (
        checkClassMatch(p.className, cls) &&
        checkSectionMatch(p.section, sec) &&
        p.subject.toLowerCase().trim() === sub.toLowerCase().trim()
      ) {
        const chName = (p.chapterFolder || p.title || '').trim()
        if (chName && !map.has(chName.toLowerCase())) {
          map.set(chName.toLowerCase(), {
            id: `auto_${chName}`,
            className: p.className,
            section: p.section,
            subject: p.subject,
            lessonName: chName,
            color: 'teal'
          })
        }
      }
    })

    return Array.from(map.values())
  }, [chapterFolders, plans])

  // Filtered Chapters for currently selected Subject
  const currentSubjectChapters = useMemo(() => {
    if (!selectedClass || !selectedSection || !selectedSubject) return []
    const list = getSubjectChapters(selectedClass, selectedSection, selectedSubject)
    if (!chapterSearch.trim()) return list
    return list.filter(ch => ch.lessonName.toLowerCase().includes(chapterSearch.toLowerCase().trim()))
  }, [selectedClass, selectedSection, selectedSubject, getSubjectChapters, chapterSearch])

  // ── Helper: Get Plans for a specific Chapter ─────────────────────────────
  const getChapterPlans = useCallback((cls: string, sec: string, sub: string, chapter: string): LessonPlanRecord[] => {
    return plans.filter(p => {
      const matchCls = checkClassMatch(p.className, cls)
      const matchSec = checkSectionMatch(p.section, sec)
      const matchSub = p.subject.toLowerCase().trim() === sub.toLowerCase().trim()
      const pFolder = (p.chapterFolder || p.title || '').toLowerCase().trim()
      const matchChapter = pFolder === chapter.toLowerCase().trim() || p.title.toLowerCase().trim() === chapter.toLowerCase().trim()
      return matchCls && matchSec && matchSub && matchChapter
    })
  }, [plans])

  // Current Chapter Plans
  const currentChapterPlans = useMemo(() => {
    if (!selectedClass || !selectedSection || !selectedSubject || !selectedChapter) return []
    return getChapterPlans(selectedClass, selectedSection, selectedSubject, selectedChapter)
  }, [selectedClass, selectedSection, selectedSubject, selectedChapter, getChapterPlans])

  // Progress metrics helpers
  const getClassPlanCount = (cls: string) => plans.filter(p => checkClassMatch(p.className, cls)).length
  const getSectionPlanCount = (cls: string, sec: string) => plans.filter(p => checkClassMatch(p.className, cls) && checkSectionMatch(p.section, sec)).length
  const getSubjectPlanCount = (cls: string, sec: string, sub: string) => plans.filter(p => checkClassMatch(p.className, cls) && checkSectionMatch(p.section, sec) && p.subject.toLowerCase().trim() === sub.toLowerCase().trim()).length

  const getChapterProgress = (cls: string, sec: string, sub: string, chapter: string) => {
    const list = getChapterPlans(cls, sec, sub, chapter)
    if (list.length === 0) return 0
    return Math.round(list.reduce((sum, p) => sum + (p.progress || 0), 0) / list.length)
  }

  // ── All Plans View Filters ─────────────────────────────────────────────────
  const allPlansFiltered = useMemo(() => {
    return plans.filter(p => {
      if (filterClass !== 'all' && !checkClassMatch(p.className, filterClass)) return false
      if (filterSection !== 'all' && !checkSectionMatch(p.section, filterSection)) return false
      if (filterSubject !== 'all' && p.subject.toLowerCase().trim() !== filterSubject.toLowerCase().trim()) return false
      if (filterChapter !== 'all') {
        const pCh = (p.chapterFolder || p.title || '').toLowerCase().trim()
        if (pCh !== filterChapter.toLowerCase().trim()) return false
      }
      if (statusFilter === 'completed' && p.progress < 100) return false
      if (statusFilter === 'in_progress' && (p.progress <= 0 || p.progress >= 100)) return false
      if (statusFilter === 'not_started' && p.progress !== 0) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = p.title.toLowerCase().includes(q)
        const matchSubject = p.subject.toLowerCase().includes(q)
        const matchMethod = p.methodology.toLowerCase().includes(q)
        const matchClass = p.className.toLowerCase().includes(q)
        const matchChapter = (p.chapterFolder || '').toLowerCase().includes(q)
        if (!matchTitle && !matchSubject && !matchMethod && !matchClass && !matchChapter) return false
      }
      return true
    })
  }, [plans, filterClass, filterSection, filterSubject, filterChapter, statusFilter, searchQuery])

  // Stats
  const totalCount = plans.length
  const completedCount = plans.filter(p => p.progress >= 100).length
  const inProgressCount = plans.filter(p => p.progress > 0 && p.progress < 100).length
  const avgProgress = totalCount > 0 ? Math.round(plans.reduce((acc, p) => acc + (p.progress || 0), 0) / totalCount) : 0

  // ── Form Cascading Helpers ────────────────────────────────────────────────
  const formAvailableSections = useMemo(() => {
    if (!formClass) return []
    return getAvailableSectionsForClass(formClass, masterSections, unifiedClasses)
  }, [formClass, masterSections, unifiedClasses])

  const formAvailableSubjects = useMemo(() => {
    if (!formClass) return []
    return getAvailableSubjectsForClass(formClass, masterSubjects)
  }, [formClass, masterSubjects])

  const formAvailableChapters = useMemo(() => {
    if (!formClass || !formSection || !formSubject) return []
    const list = getSubjectChapters(formClass, formSection, formSubject)
    return list.map(c => c.lessonName)
  }, [formClass, formSection, formSubject, getSubjectChapters])

  // ── Open Create / Edit Chapter Folder Modal ────────────────────────────────
  const openCreateChapterModal = (cName?: string, sName?: string, subName?: string) => {
    setEditingChapter(null)
    setChapterFormClass(cName || selectedClass || unifiedClasses[0]?.className || 'Class 1')
    setChapterFormSection(sName || selectedSection || 'Section A')
    setChapterFormSubject(subName || selectedSubject || 'English')
    setChapterFormName('')
    setChapterFormNumber('')
    setChapterFormDesc('')
    setChapterFormColor('teal')
    setChapterModalOpen(true)
  }

  const openEditChapterModal = (ch: ChapterFolder) => {
    setEditingChapter(ch)
    setChapterFormClass(ch.className)
    setChapterFormSection(ch.section)
    setChapterFormSubject(ch.subject)
    setChapterFormName(ch.lessonName)
    setChapterFormNumber(ch.lessonNumber || '')
    setChapterFormDesc(ch.description || '')
    setChapterFormColor(ch.color || 'teal')
    setChapterModalOpen(true)
  }

  // Handle Save / Update Book Title
  const handleSaveChapterFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = chapterFormName.trim()
    if (!trimmedName || !chapterFormClass || !chapterFormSection || !chapterFormSubject) {
      triggerToast('Please enter a book title and select class/section/subject')
      return
    }

    const canonicalClass = normalizeClassName(chapterFormClass)
    const canonicalSection = normalizeSectionName(chapterFormSection)

    // Pre-check for duplicate book title in same class, section, subject
    const isDup = chapterFolders.some(ch =>
      checkClassMatch(ch.className, canonicalClass) &&
      checkSectionMatch(ch.section, canonicalSection) &&
      ch.subject.toLowerCase().trim() === chapterFormSubject.toLowerCase().trim() &&
      ch.lessonName.toLowerCase().trim() === trimmedName.toLowerCase() &&
      ch.id !== editingChapter?.id
    )

    if (isDup) {
      triggerToast(`A book titled "${trimmedName}" already exists for ${canonicalClass} • ${canonicalSection} • ${chapterFormSubject}.`)
      return
    }

    setSubmittingChapter(true)
    try {
      if (editingChapter && !editingChapter.id.startsWith('auto_')) {
        const res = await fetch(`/api/institute/study-materials/lessons/${editingChapter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonName: trimmedName,
            lessonNumber: chapterFormNumber.trim(),
            description: chapterFormDesc.trim(),
            color: chapterFormColor
          })
        })
        const json = await res.json()
        if (json.success) {
          triggerToast(`Book renamed to "${trimmedName}"!`)
          setChapterModalOpen(false)
          if (selectedChapter === editingChapter.lessonName) {
            setSelectedChapter(trimmedName)
          }
          if (formChapter === editingChapter.lessonName) {
            setFormChapter(trimmedName)
          }
          setEditingChapter(null)
          fetchChapters()
          fetchPlans()
        } else {
          triggerToast(json.error || 'Failed to update book')
        }
      } else {
        const res = await fetch('/api/institute/study-materials/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            className: canonicalClass,
            section: canonicalSection,
            subject: chapterFormSubject.trim(),
            lessonName: trimmedName,
            lessonNumber: chapterFormNumber.trim(),
            description: chapterFormDesc.trim(),
            color: chapterFormColor
          })
        })
        const json = await res.json()
        if (json.success) {
          triggerToast(`Book "${trimmedName}" saved successfully!`)
          setChapterModalOpen(false)
          if (editingChapter && selectedChapter === editingChapter.lessonName) {
            setSelectedChapter(trimmedName)
          } else if (selectedClass && selectedSection && selectedSubject) {
            setSelectedChapter(trimmedName)
          }
          if (editingChapter && formChapter === editingChapter.lessonName) {
            setFormChapter(trimmedName)
          }
          setEditingChapter(null)
          fetchChapters()
          fetchPlans()
        } else {
          triggerToast(json.error || 'Failed to create book')
        }
      }
    } catch (err: any) {
      console.error(err)
      triggerToast(err.message || 'An error occurred')
    } finally {
      setSubmittingChapter(false)
    }
  }

  // Handle Delete Book Title
  const handleDeleteChapterConfirm = async () => {
    if (!deleteChapterId) return
    try {
      if (!deleteChapterId.startsWith('auto_')) {
        await fetch(`/api/institute/study-materials/lessons/${deleteChapterId}`, {
          method: 'DELETE'
        })
      }
      triggerToast('Book title removed.')
      setDeleteChapterId(null)
      if (selectedChapter) setSelectedChapter(null)
      fetchChapters()
      fetchPlans()
    } catch (err: any) {
      console.error(err)
      triggerToast('Error deleting book')
    }
  }

  // ── Open Add Lesson Plan Modal ─────────────────────────────────────────────
  const openAddPlanModal = (defaultChapter?: string) => {
    setEditingPlanId(null)
    const initialClass = selectedClass || (filterClass !== 'all' ? filterClass : (unifiedClasses[0]?.className || 'Class 1'))
    const initialSec = selectedSection || (filterSection !== 'all' ? filterSection : 'Section A')
    const initialSub = selectedSubject || (filterSubject !== 'all' ? filterSubject : 'English')
    const initialCh = defaultChapter || selectedChapter || (filterChapter !== 'all' ? filterChapter : '')

    setFormClass(initialClass)
    setFormSection(initialSec)
    setFormSubject(initialSub)
    setFormChapter(initialCh)
    setFormNewChapterMode(false)
    setFormTitle('')
    setFormMethodology('Interactive Problem Solving & Lab Work')
    setFormDescription('')
    setFormProgress(0)
    setFormMilestones([
      {
        id: 1,
        unit: 'Topic 1',
        lesson: '',
        topic: '',
        methodology: 'Interactive Problem Solving & Lab Work',
        description: '',
        startDate: '',
        endDate: '',
        progress: 0,
        completed: false
      }
    ])
    setFormAttachmentName('')
    setFormError('')
    setFormModalOpen(true)
  }

  // ── Open Edit Lesson Plan Modal ────────────────────────────────────────────
  const openEditPlanModal = (item: LessonPlanRecord) => {
    setEditingPlanId(item.id)
    setFormClass(item.className)
    setFormSection(item.section)
    setFormSubject(item.subject)
    setFormChapter(item.chapterFolder || item.title || '')
    setFormNewChapterMode(false)
    setFormTitle(item.title)
    setFormMethodology(item.methodology || 'Structured Teaching')
    setFormDescription(item.description || '')
    setFormProgress(item.progress || 0)
    setFormMilestones(
      Array.isArray(item.milestones) && item.milestones.length > 0
        ? item.milestones
        : [
            {
              id: 1,
              unit: 'Topic 1',
              lesson: item.title,
              topic: item.title,
              methodology: item.methodology,
              description: item.description || '',
              startDate: '',
              endDate: '',
              progress: item.progress || 0,
              completed: (item.progress || 0) >= 100
            }
          ]
    )
    setFormAttachmentName(item.attachmentName || '')
    setFormError('')
    setFormModalOpen(true)
  }

  // ── Milestone Row Operations in Form ──────────────────────────────────────
  const handleAddMilestone = () => {
    const nextId = formMilestones.length > 0 ? Math.max(...formMilestones.map(m => m.id)) + 1 : 1
    setFormMilestones(prev => [
      ...prev,
      {
        id: nextId,
        unit: `Topic ${nextId}`,
        lesson: formTitle || '',
        topic: '',
        methodology: formMethodology,
        description: '',
        startDate: '',
        endDate: '',
        progress: 0,
        completed: false
      }
    ])
  }

  const handleRemoveMilestone = (id: number) => {
    if (formMilestones.length === 1) {
      triggerToast('At least one topic milestone is required.')
      return
    }
    setFormMilestones(prev => prev.filter(m => m.id !== id))
  }

  const handleMilestoneChange = (id: number, field: keyof Milestone, value: any) => {
    setFormMilestones(prev =>
      prev.map(m => {
        if (m.id !== id) return m
        const updated = { ...m, [field]: value }
        if (field === 'completed') {
          updated.progress = value ? 100 : 0
        }
        return updated
      })
    )
  }

  // Auto-sync overall progress from milestone checkboxes
  useEffect(() => {
    if (formMilestones.length > 0) {
      const completedCount = formMilestones.filter(m => m.completed).length
      const autoCalculated = Math.round((completedCount / formMilestones.length) * 100)
      setFormProgress(autoCalculated)
    }
  }, [formMilestones])

  // ── Handle Save Lesson Plan Submission ────────────────────────────────────
  const handleSavePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!formClass || !formSection || !formSubject) {
      setFormError('Class, Section, and Subject are required.')
      return
    }

    if (!formTitle.trim()) {
      setFormError('Please enter a lesson plan title.')
      return
    }

    const resolvedChapter = (formChapter.trim() || formTitle.trim())
    const canonicalClass = normalizeClassName(formClass)

    setSubmittingForm(true)
    try {
      const payload = {
        className: canonicalClass,
        section: normalizeSectionName(formSection),
        subject: formSubject.trim(),
        chapterFolder: resolvedChapter,
        title: formTitle.trim(),
        methodology: formMethodology.trim(),
        description: formDescription.trim(),
        progress: formProgress,
        milestones: formMilestones,
        attachmentName: formAttachmentName.trim()
      }

      if (editingPlanId) {
        const res = await fetch(`/api/institute/lesson-plans/${editingPlanId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update plan')
        triggerToast('Lesson plan updated successfully!')
      } else {
        const res = await fetch('/api/institute/lesson-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create plan')
        triggerToast(`Lesson plan created under book "${resolvedChapter}"!`)
      }

      setFormModalOpen(false)
      fetchPlans()
      fetchChapters()
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || 'An error occurred while saving.')
    } finally {
      setSubmittingForm(false)
    }
  }

  // ── Handle Delete Lesson Plan ─────────────────────────────────────────────
  const handleDeletePlanConfirm = async () => {
    if (!deletePlanId) return
    try {
      const res = await fetch(`/api/institute/lesson-plans/${deletePlanId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (res.ok && data.success) {
        triggerToast('Lesson plan deleted successfully.')
        setPlans(prev => prev.filter(p => p.id !== deletePlanId))
        fetchChapters()
      } else {
        triggerToast(data.error || 'Failed to delete plan')
      }
    } catch (err) {
      triggerToast('Error deleting lesson plan')
    } finally {
      setDeletePlanId(null)
      if (viewPlan && viewPlan.id === deletePlanId) setViewPlan(null)
    }
  }

  // ── Quick Progress Update Modal Handlers ──────────────────────────────────
  const handleOpenProgressModal = (plan: LessonPlanRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setProgressPlan(plan)
    setTempProgress(plan.progress || 0)
    setTempMilestones(
      Array.isArray(plan.milestones) && plan.milestones.length > 0
        ? plan.milestones
        : [
            {
              id: 1,
              topic: plan.title,
              startDate: '',
              endDate: '',
              completed: (plan.progress || 0) >= 100
            }
          ]
    )
    setProgressModalOpen(true)
  }

  const handleToggleTempMilestone = (id: number) => {
    const updated = tempMilestones.map(m => (m.id === id ? { ...m, completed: !m.completed } : m))
    setTempMilestones(updated)
    const completedCount = updated.filter(m => m.completed).length
    const calculated = Math.round((completedCount / updated.length) * 100)
    setTempProgress(calculated)
  }

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
      const data = await res.json()
      if (res.ok && data.success) {
        triggerToast(`Progress updated to ${tempProgress}%!`)
        setProgressModalOpen(false)
        fetchPlans()
      } else {
        triggerToast(data.error || 'Failed to update progress')
      }
    } catch (e) {
      triggerToast('Error saving progress')
    } finally {
      setUpdatingProgress(false)
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (plans.length === 0) {
      alert('No lesson plans available to export.')
      return
    }

    const headers = ['S.No.', 'Class', 'Section', 'Subject', 'Book Title', 'Lesson Title', 'Methodology', 'Date', 'Progress (%)']
    const rows = plans.map((p, i) => [
      i + 1,
      `"${p.className}"`,
      `"${p.section}"`,
      `"${p.subject}"`,
      `"${(p.chapterFolder || p.title || '').replace(/"/g, '""')}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.methodology.replace(/"/g, '""')}"`,
      `"${p.date}"`,
      `${p.progress}%`
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

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-4">

        {/* ── TOP UNIFIED LOCATION NAVIGATION & FILTER BAR (FULL WIDTH) ────────── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-3.5 w-full">
          {/* Row 1: Dynamic Location Navigation Breadcrumbs + Add Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Dynamic Location Navigation Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSelectedClass(null)
                  setSelectedSection(null)
                  setSelectedSubject(null)
                  setSelectedChapter(null)
                }}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentLevel === 'classes'
                    ? 'text-[#007A78] font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Folder className="w-4 h-4 text-[#007A78]" />
                <span>All Classes</span>
              </button>

              {selectedClass && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSection(null)
                      setSelectedSubject(null)
                      setSelectedChapter(null)
                    }}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      currentLevel === 'sections'
                        ? 'text-[#007A78] font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{selectedClass}</span>
                  </button>
                </>
              )}

              {selectedSection && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubject(null)
                      setSelectedChapter(null)
                    }}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      currentLevel === 'subjects'
                        ? 'text-[#007A78] font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{selectedSection}</span>
                  </button>
                </>
              )}

              {selectedSubject && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChapter(null)
                    }}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      currentLevel === 'chapters'
                        ? 'text-[#007A78] font-black bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{selectedSubject}</span>
                  </button>
                </>
              )}

              {selectedChapter && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="flex items-center gap-1.5 font-black text-[#007A78] bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                    <BookOpen className="w-3.5 h-3.5 text-[#007A78]" />
                    <span>Book: {selectedChapter}</span>
                  </span>
                </>
              )}
            </div>

            {/* Top Action Buttons (with Filters) */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {currentLevel !== 'classes' && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentLevel === 'content') setSelectedChapter(null)
                    else if (currentLevel === 'chapters') setSelectedSubject(null)
                    else if (currentLevel === 'subjects') setSelectedSection(null)
                    else if (currentLevel === 'sections') setSelectedClass(null)
                  }}
                  className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => openCreateChapterModal(selectedClass || undefined, selectedSection || undefined, selectedSubject || undefined)}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#007A78]" />
                <span>+ Add Book Title</span>
              </button>

              <button
                type="button"
                onClick={() => openAddPlanModal(selectedChapter || undefined)}
                className="px-4 py-2 text-xs font-black text-white bg-[#007A78] hover:bg-teal-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lesson Plan</span>
              </button>
            </div>
          </div>

          {/* Row 2: View Switcher, Status Filters & Search Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* View Mode Switcher */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode('folders')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'folders'
                      ? 'bg-white text-[#007A78] shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Curriculum Folders</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all-plans')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'all-plans'
                      ? 'bg-white text-[#007A78] shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>All Plans ({plans.length})</span>
                </button>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'all', label: 'All Plans' },
                  { id: 'in_progress', label: `In Progress (${inProgressCount})` },
                  { id: 'completed', label: `Completed (${completedCount})` },
                  { id: 'not_started', label: `Not Started (${plans.filter(p => (p.progress || 0) === 0).length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      statusFilter === tab.id
                        ? 'bg-[#007A78] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Search & Export */}
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-60 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search plans, topics, methodology..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-[#007A78]"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="p-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Export to CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MODE 1: ALL LESSON PLANS TABLE VIEW (FULL WIDTH)
           ========================================================================= */}
        {viewMode === 'all-plans' && (
          <div className="space-y-4 animate-in fade-in duration-200 w-full">
            {/* Filter Dropdowns Strip for Location & Content */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-bold">
                {/* 1. Filter Class */}
                <div>
                  <label className="block text-slate-500 mb-1 text-[11px]">Class</label>
                  <select
                    value={filterClass}
                    onChange={e => {
                      setFilterClass(e.target.value)
                      setFilterSection('all')
                      setFilterSubject('all')
                      setFilterChapter('all')
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                  >
                    <option value="all">All Classes ({plans.length} plans)</option>
                    {unifiedClasses.map(c => {
                      const count = getClassPlanCount(c.className)
                      return (
                        <option key={c.className} value={c.className}>
                          {c.className} ({count} {count === 1 ? 'plan' : 'plans'})
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* 2. Filter Section */}
                <div>
                  <label className="block text-slate-500 mb-1 text-[11px]">Section</label>
                  <select
                    value={filterSection}
                    onChange={e => {
                      setFilterSection(e.target.value)
                      setFilterChapter('all')
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                  >
                    <option value="all">All Sections</option>
                    {Array.from(new Set(plans.filter(p => filterClass === 'all' || checkClassMatch(p.className, filterClass)).map(p => p.section))).map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Filter Subject */}
                <div>
                  <label className="block text-slate-500 mb-1 text-[11px]">Subject</label>
                  <select
                    value={filterSubject}
                    onChange={e => {
                      setFilterSubject(e.target.value)
                      setFilterChapter('all')
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                  >
                    <option value="all">All Subjects</option>
                    {Array.from(new Set(plans.filter(p => (filterClass === 'all' || checkClassMatch(p.className, filterClass)) && (filterSection === 'all' || p.section.toLowerCase() === filterSection.toLowerCase())).map(p => p.subject))).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Filter Book */}
                <div>
                  <label className="block text-slate-500 mb-1 text-[11px]">Book Title</label>
                  <select
                    value={filterChapter}
                    onChange={e => setFilterChapter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                  >
                    <option value="all">All Books</option>
                    {Array.from(new Set(plans.map(p => (p.chapterFolder || p.title || '').trim()).filter(Boolean))).map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Plans Table (Full Width) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs w-full">
              {allPlansFiltered.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#007A78] flex items-center justify-center shadow-2xs">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">No Lesson Plans Found</h3>
                  <p className="text-xs text-slate-500 font-medium max-w-sm">
                    No lesson plans match your current search and filter selections.
                  </p>
                  <button
                    type="button"
                    onClick={() => openAddPlanModal()}
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#007A78] hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Lesson Plan</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100 font-semibold text-xs">
                  <table className="w-full text-center border-collapse">
                    <thead className="bg-slate-50/80 font-black text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-3.5 w-12">S. No.</th>
                        <th className="px-3 py-3.5 text-left min-w-[200px]">Class & Subject Path</th>
                        <th className="px-3 py-3.5 text-left min-w-[180px]">Lesson Title</th>
                        <th className="px-3 py-3.5 text-left min-w-[150px]">Methodology</th>
                        <th className="px-3 py-3.5 w-24">Date</th>
                        <th className="px-3 py-3.5 min-w-[160px] text-left">Syllabus Progress</th>
                        <th className="px-3 py-3.5 w-28">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {allPlansFiltered.map((item, idx) => {
                        const percent = Math.min(100, Math.max(0, item.progress || 0))
                        const totalM = item.milestones?.length || item.totalMilestones || 1
                        const completedM = item.milestones ? item.milestones.filter(m => m.completed).length : Math.round((percent / 100) * totalM)
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => setViewPlan(item)}>
                            <td className="px-3 py-3.5 text-slate-400 font-bold">{idx + 1}.</td>
                            <td className="px-3 py-3.5 text-left">
                              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 flex-wrap">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{item.className}</span>
                                <span className="text-slate-300">&bull;</span>
                                <span className="text-slate-600">{item.section}</span>
                                <span className="text-slate-300">&bull;</span>
                                <span className="text-[#007A78] font-bold">{item.subject}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-[#007A78]" />
                                <span>Book: {item.chapterFolder || item.title}</span>
                              </p>
                            </td>
                            <td className="px-3 py-3.5 text-left">
                              <div className="font-black text-slate-900 text-xs">{item.title}</div>
                              {item.description && (
                                <p className="text-[10.5px] text-slate-400 font-medium line-clamp-1 mt-0.5">{item.description}</p>
                              )}
                            </td>
                            <td className="px-3 py-3.5 text-left text-slate-600 text-[11px]">
                              <span className="line-clamp-2">{item.methodology}</span>
                            </td>
                            <td className="px-3 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                              {item.date}
                            </td>
                            <td className="px-3 py-3.5 text-left" onClick={e => handleOpenProgressModal(item, e)}>
                              <div className="flex flex-col gap-1 min-w-[130px] group/prog">
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`px-2 py-0.5 rounded-md font-black text-[10.5px] ${
                                    percent >= 100 ? 'bg-emerald-50 text-emerald-700' : percent > 0 ? 'bg-teal-50 text-[#007A78]' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {percent}%
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold group-hover/prog:text-[#007A78] flex items-center gap-0.5">
                                    <span>{completedM}/{totalM} Topics</span>
                                    <Sliders className="w-2.5 h-2.5" />
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div className={`h-full rounded-full transition-all ${percent >= 100 ? 'bg-emerald-500' : 'bg-[#007A78]'}`} style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={e => handleOpenProgressModal(item, e)} className="p-1 text-[#007A78] hover:bg-teal-50 rounded" title="Update Progress">
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setViewPlan(item)} className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Plan">
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => openEditPlanModal(item)} className="p-1 text-slate-500 hover:text-[#007A78] hover:bg-teal-50 rounded" title="Edit Plan">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setDeletePlanId(item.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded" title="Delete Plan">
                                  <Trash2 className="w-3.5 h-3.5" />
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
            </div>
          </div>
        )}

        {/* =========================================================================
            MODE 2: DRILL-DOWN CURRICULUM FOLDERS VIEW (FULL WIDTH)
           ========================================================================= */}
        {viewMode === 'folders' && (
          <div className="w-full">

            {/* ── LEVEL 1: ALL CLASSES VIEW (FULL WIDTH CARD) ────────────────────── */}
            {currentLevel === 'classes' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 w-full space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      Curriculum by Class ({filteredClasses.length})
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      Select a class to browse sections, subjects, books, and lesson plans
                    </p>
                  </div>
                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search class..."
                      value={classSearch}
                      onChange={e => setClassSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-[#007A78]"
                    />
                  </div>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredClasses.map(cls => {
                    const count = getClassPlanCount(cls.className)
                    const sectionsList = getAvailableSectionsForClass(cls.className, masterSections, unifiedClasses)

                    return (
                      <div
                        key={cls.className}
                        onClick={() => setSelectedClass(cls.className)}
                        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#007A78] transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#007A78] flex items-center justify-center font-black text-lg group-hover:scale-105 group-hover:bg-[#007A78] group-hover:text-white transition-all shadow-2xs">
                              <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase ${
                              count > 0 ? 'bg-teal-50 text-[#007A78] border border-teal-200' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {count > 0 ? `${count} Plans` : '0 Plans'}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900 group-hover:text-[#007A78] transition-colors">
                            {cls.className}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 font-medium">
                            {sectionsList.length} {sectionsList.length === 1 ? 'Section' : 'Sections'}
                          </p>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#007A78]">
                          <span>Open Sections</span>
                          <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Explore <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── LEVEL 2: SECTIONS VIEW (FULL WIDTH CARD) ───────────────────────── */}
            {currentLevel === 'sections' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 w-full space-y-5 animate-in fade-in duration-200">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Sections in {selectedClass} ({availableSections.length})
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Select a section to view its assigned subjects and lesson plans
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableSections.map(sec => {
                    const count = getSectionPlanCount(selectedClass!, sec)
                    return (
                      <div
                        key={sec}
                        onClick={() => setSelectedSection(sec)}
                        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#007A78] transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#007A78] flex items-center justify-center font-black text-lg group-hover:scale-105 group-hover:bg-[#007A78] group-hover:text-white transition-all shadow-2xs">
                              <Layers className="w-6 h-6" />
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase ${
                              count > 0 ? 'bg-teal-50 text-[#007A78] border border-teal-200' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {count} {count === 1 ? 'Plan' : 'Plans'}
                            </span>
                          </div>

                          <h3 className="text-lg font-black text-slate-900 group-hover:text-[#007A78] transition-colors">
                            {sec}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 font-medium">
                            {selectedClass} &bull; {availableSubjects.length} Subjects
                          </p>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#007A78]">
                          <span>Select Section</span>
                          <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Open <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── LEVEL 3: SUBJECTS VIEW (FULL WIDTH CARD) ───────────────────────── */}
            {currentLevel === 'subjects' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 w-full space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      Subjects in {selectedClass} &bull; {selectedSection} ({filteredSubjects.length})
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      Select a subject to view its books and lesson plans
                    </p>
                  </div>
                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search subject..."
                      value={subjectSearch}
                      onChange={e => setSubjectSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-[#007A78]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredSubjects.map(sub => {
                    const count = getSubjectPlanCount(selectedClass!, selectedSection!, sub)
                    const chCount = getSubjectChapters(selectedClass!, selectedSection!, sub).length
                    return (
                      <div
                        key={sub}
                        onClick={() => {
                          setSelectedSubject(sub)
                          setSelectedChapter(null)
                        }}
                        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#007A78] transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#007A78] flex items-center justify-center font-black text-lg group-hover:scale-105 group-hover:bg-[#007A78] group-hover:text-white transition-all shadow-2xs">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase ${
                              count > 0 ? 'bg-teal-50 text-[#007A78] border border-teal-200' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {count} {count === 1 ? 'Plan' : 'Plans'}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900 group-hover:text-[#007A78] transition-colors">
                            {sub}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 font-medium">
                            {chCount} {chCount === 1 ? 'Book' : 'Books'}
                          </p>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#007A78]">
                          <span>View Books</span>
                          <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Open <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── LEVEL 4: BOOKS VIEW (THEN ADD BOOKS) ─────────────────────────── */}
            {currentLevel === 'chapters' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 w-full space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span>Books in {selectedSubject}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#007A78] text-[11px] font-black border border-teal-200">
                        {currentSubjectChapters.length} {currentSubjectChapters.length === 1 ? 'Book' : 'Books'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {selectedClass} &bull; {selectedSection} &bull; {getSubjectPlanCount(selectedClass!, selectedSection!, selectedSubject!)} total lesson plans
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="relative w-48 sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search books..."
                        value={chapterSearch}
                        onChange={e => setChapterSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-[#007A78]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => openCreateChapterModal(selectedClass!, selectedSection!, selectedSubject!)}
                      className="px-3.5 py-2 bg-[#007A78] hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>+ Add Book Title</span>
                    </button>
                  </div>
                </div>

                {/* Books Grid */}
                {currentSubjectChapters.length === 0 ? (
                  <div className="py-12 sm:py-16 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#007A78] flex items-center justify-center shadow-2xs">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-black text-slate-900">
                      No Books in {selectedSubject} Yet
                    </h3>
                    <p className="text-xs text-slate-500 font-medium max-w-sm">
                      Add your first book title to organize lesson plans, teaching methodology, and syllabus milestones inside {selectedSubject}.
                    </p>
                    <button
                      type="button"
                      onClick={() => openCreateChapterModal(selectedClass!, selectedSection!, selectedSubject!)}
                      className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#007A78] hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Book Title</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {currentSubjectChapters.map(chapter => {
                      const chPlans = getChapterPlans(selectedClass!, selectedSection!, selectedSubject!, chapter.lessonName)
                      const count = chPlans.length
                      const prog = getChapterProgress(selectedClass!, selectedSection!, selectedSubject!, chapter.lessonName)

                      return (
                        <div
                          key={chapter.id || chapter.lessonName}
                          className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#007A78] transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div
                                onClick={() => setSelectedChapter(chapter.lessonName)}
                                className="w-12 h-12 rounded-xl bg-teal-50 text-[#007A78] group-hover:bg-[#007A78] group-hover:text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                              >
                                <BookOpen className="w-6 h-6" />
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-black uppercase ${
                                  count > 0 ? 'bg-teal-50 text-[#007A78]' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {count} {count === 1 ? 'Plan' : 'Plans'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openEditChapterModal(chapter)}
                                  title="Edit Book Title"
                                  className="p-1 text-slate-400 hover:text-[#007A78] hover:bg-slate-100 rounded cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteChapterId(chapter.id)}
                                  title="Delete Book"
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h3
                              onClick={() => setSelectedChapter(chapter.lessonName)}
                              className="text-base font-black text-slate-900 group-hover:text-[#007A78] transition-colors cursor-pointer"
                            >
                              {chapter.lessonName}
                            </h3>

                            {/* Progress bar inside book */}
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                                <span>Progress</span>
                                <span className={prog >= 100 ? 'text-emerald-600' : 'text-[#007A78]'}>{prog}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${prog >= 100 ? 'bg-emerald-500' : 'bg-[#007A78]'}`}
                                  style={{ width: `${prog}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div
                            onClick={() => setSelectedChapter(chapter.lessonName)}
                            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#007A78] cursor-pointer"
                          >
                            <span>Explore Book Plans</span>
                            <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Open <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── LEVEL 5: BOOK CONTENT / LESSON PLANS (THEN ADD CONTENT) ────────── */}
            {currentLevel === 'content' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 w-full space-y-6 animate-in fade-in duration-200">
                {/* Book Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#007A78] flex items-center justify-center shrink-0 shadow-2xs">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">
                          Book: {selectedChapter}
                        </h2>
                        <button
                          type="button"
                          onClick={() => {
                            const matched = currentSubjectChapters.find(
                              c => c.lessonName.toLowerCase().trim() === selectedChapter?.toLowerCase().trim()
                            )
                            if (matched) {
                              openEditChapterModal(matched)
                            } else {
                              openCreateChapterModal(selectedClass!, selectedSection!, selectedSubject!)
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Rename Book Title"
                        >
                          <Pencil className="w-3 h-3 text-[#007A78]" />
                          <span>Rename Book</span>
                        </button>
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#007A78] text-[11px] font-black border border-teal-200">
                          {currentChapterPlans.length} {currentChapterPlans.length === 1 ? 'Plan' : 'Plans'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        {selectedClass} &bull; {selectedSection} &bull; {selectedSubject}
                      </p>
                    </div>
                  </div>

                  {/* Single Clean Add Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openAddPlanModal(selectedChapter!)}
                      className="px-4 py-2.5 bg-[#007A78] hover:bg-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Lesson Plan</span>
                    </button>
                  </div>
                </div>

                {/* Content Inside Book */}
                {currentChapterPlans.length === 0 ? (
                  /* Clean Full Width Empty State with Single Add Button */
                  <div className="py-12 sm:py-16 text-center flex flex-col items-center justify-center space-y-3 w-full">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#007A78] flex items-center justify-center shadow-2xs">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      No Lesson Plans in &ldquo;{selectedChapter}&rdquo;
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm max-w-md font-medium">
                      This book is currently empty. Click the button below to add your first lesson plan, teaching methodology, and syllabus milestones.
                    </p>
                    <button
                      type="button"
                      onClick={() => openAddPlanModal(selectedChapter!)}
                      className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#007A78] hover:bg-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Lesson Plan</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {currentChapterPlans.map(item => {
                      const percent = Math.min(100, Math.max(0, item.progress || 0))
                      const totalM = item.milestones?.length || item.totalMilestones || 1
                      const completedM = item.milestones ? item.milestones.filter(m => m.completed).length : Math.round((percent / 100) * totalM)

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                        >
                          <div className="p-5">
                            {/* Header row: Status badge + Methodology */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider ${
                                percent >= 100
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : percent > 0
                                  ? 'bg-teal-50 text-[#007A78] border border-teal-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {percent >= 100 ? 'Completed' : percent > 0 ? 'In Progress' : 'Not Started'}
                              </span>

                              <span className="text-[11px] font-bold text-slate-500">
                                {item.date}
                              </span>
                            </div>

                            <h3 className="text-base font-black text-slate-900 line-clamp-2">
                              {item.title}
                            </h3>

                            <div className="mt-2 inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-bold">
                              {item.methodology}
                            </div>

                            {item.description && (
                              <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 font-medium">
                                {item.description}
                              </p>
                            )}

                            {/* Syllabus Milestones / Topics Checklist */}
                            {Array.isArray(item.milestones) && item.milestones.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                                <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                  <span>Syllabus Topics</span>
                                  <span className="text-[#007A78]">{completedM}/{totalM} Done</span>
                                </div>
                                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                                  {item.milestones.map((m, mIdx) => (
                                    <div key={m.id || mIdx} className="flex items-center gap-2 text-[11.5px] font-medium text-slate-600">
                                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 text-[10px] ${
                                        m.completed ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                                      }`}>
                                        {m.completed && <Check className="w-2.5 h-2.5" />}
                                      </span>
                                      <span className={`truncate ${m.completed ? 'line-through text-slate-400' : ''}`}>
                                        {m.topic || m.unit || `Topic ${mIdx + 1}`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Progress bar */}
                            <div className="mt-4 space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                <span>Progress</span>
                                <span className={percent >= 100 ? 'text-emerald-600' : 'text-[#007A78]'}>{percent}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${percent >= 100 ? 'bg-emerald-500' : 'bg-[#007A78]'}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleOpenProgressModal(item)}
                              className="px-3 py-1.5 bg-[#007A78] hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Update Progress</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setViewPlan(item)}
                                title="View Details"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditPlanModal(item)}
                                title="Edit Plan"
                                className="p-1.5 text-slate-500 hover:text-[#007A78] hover:bg-teal-50 rounded-lg transition cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletePlanId(item.id)}
                                title="Delete Plan"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
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

          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL 1: CREATE & EDIT BOOK TITLE
         ========================================================================= */}
      {chapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#007A78] flex items-center justify-center shadow-2xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingChapter ? 'Edit Book Title' : 'Add Book Title'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Organize your lesson plans under this book or syllabus title
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChapterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveChapterFolder} className="p-5 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Class</label>
                  <select
                    value={chapterFormClass}
                    onChange={e => setChapterFormClass(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#007A78]"
                  >
                    {unifiedClasses.map(c => (
                      <option key={c.className} value={c.className}>{c.className}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Section</label>
                  <select
                    value={chapterFormSection}
                    onChange={e => setChapterFormSection(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#007A78]"
                  >
                    {getAvailableSectionsForClass(chapterFormClass, masterSections, unifiedClasses).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Subject</label>
                  <select
                    value={chapterFormSubject}
                    onChange={e => setChapterFormSubject(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#007A78]"
                  >
                    {getAvailableSubjectsForClass(chapterFormClass, masterSubjects).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honeycomb, First Flight, NCERT Mathematics, Modern Chemistry"
                  value={chapterFormName}
                  onChange={e => setChapterFormName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#007A78]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">
                  Book Theme Color
                </label>
                <div className="flex items-center gap-2 pt-0.5">
                  {[
                    { id: 'teal', bg: 'bg-[#007A78]', name: 'Teal' },
                    { id: 'blue', bg: 'bg-blue-600', name: 'Blue' },
                    { id: 'indigo', bg: 'bg-indigo-600', name: 'Indigo' },
                    { id: 'violet', bg: 'bg-violet-600', name: 'Violet' },
                    { id: 'emerald', bg: 'bg-emerald-600', name: 'Emerald' },
                    { id: 'amber', bg: 'bg-amber-500', name: 'Amber' },
                    { id: 'rose', bg: 'bg-rose-500', name: 'Rose' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      title={c.name}
                      onClick={() => setChapterFormColor(c.id)}
                      className={`w-7 h-7 rounded-full ${c.bg} transition-all flex items-center justify-center cursor-pointer ${
                        chapterFormColor === c.id ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {chapterFormColor === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">
                  Book Description / Syllabus Scope (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Core syllabus book, exercises, chapter-wise milestones and topics..."
                  value={chapterFormDesc}
                  onChange={e => setChapterFormDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-[#007A78] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setChapterModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingChapter}
                  className="px-4 py-2 text-xs font-black text-white bg-[#007A78] hover:bg-teal-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  {submittingChapter ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingChapter ? 'Save Changes' : 'Add Book Title'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD / EDIT LESSON PLAN
         ========================================================================= */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#007A78] flex items-center justify-center shadow-2xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingPlanId ? 'Edit Lesson Plan' : 'Create Lesson Plan'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Set class, section, subject, book title, and topics
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSavePlanSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs font-semibold">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Class, Section, Subject Cascading Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">Class *</label>
                    <select
                      value={formClass}
                      onChange={e => {
                        setFormClass(e.target.value)
                        setFormSection('Section A')
                      }}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                    >
                      {unifiedClasses.map(c => (
                        <option key={c.className} value={c.className}>{c.className}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">Section *</label>
                    <select
                      value={formSection}
                      onChange={e => setFormSection(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                    >
                      {formAvailableSections.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">Subject *</label>
                    <select
                      value={formSubject}
                      onChange={e => setFormSubject(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                    >
                      {formAvailableSubjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Book Title Selector / New Book */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-600 font-bold">
                      Book Title *
                    </label>
                    {formChapter && (
                      <button
                        type="button"
                        onClick={() => {
                          const matched = currentSubjectChapters.find(
                            c => c.lessonName.toLowerCase().trim() === formChapter.toLowerCase().trim()
                          )
                          if (matched) {
                            openEditChapterModal(matched)
                          } else {
                            openCreateChapterModal(formClass, formSection, formSubject)
                          }
                        }}
                        className="text-[11px] font-bold text-[#007A78] hover:underline cursor-pointer flex items-center gap-1"
                        title="Rename this book title in database"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Rename book title</span>
                      </button>
                    )}
                  </div>

                  {/* Fully Editable Input with Datalist Suggestions */}
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Type book title or select an existing book below..."
                      value={formChapter}
                      onChange={e => setFormChapter(e.target.value)}
                      list="available-chapters-datalist"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#007A78]"
                    />
                    <datalist id="available-chapters-datalist">
                      {formAvailableChapters.map(ch => (
                        <option key={ch} value={ch} />
                      ))}
                    </datalist>
                  </div>

                  {/* Quick Pick Existing Book Pills */}
                  {formAvailableChapters.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10.5px] text-slate-400 font-semibold">Existing Books:</span>
                      {formAvailableChapters.map(ch => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setFormChapter(ch)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                            formChapter.toLowerCase().trim() === ch.toLowerCase().trim()
                              ? 'bg-teal-50 text-[#007A78] border border-teal-200 font-black shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <BookOpen className="w-3 h-3 text-[#007A78]" />
                          <span>{ch}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Lesson Plan Title */}
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">
                    Lesson Plan Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Photosynthesis & Cellular Respiration or Quadratic Roots Derivation"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#007A78]"
                  />
                </div>

                {/* 4. Methodology & Attachment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">
                      Teaching Methodology *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Interactive Problem Solving & Visual Slides"
                      value={formMethodology}
                      onChange={e => setFormMethodology(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#007A78]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">
                      Attachment Name / File (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter_Worksheet.pdf"
                      value={formAttachmentName}
                      onChange={e => setFormAttachmentName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#007A78]"
                    />
                  </div>
                </div>

                {/* 5. Description */}
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">
                    Description / Learning Objectives (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief summary of teaching goals, student exercises, and curriculum targets..."
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-[#007A78] resize-none"
                  />
                </div>

                {/* 6. Topics & Syllabus Milestones Checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Syllabus Topics & Milestones ({formMilestones.length})
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Check off completed topics to update syllabus progress automatically
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMilestone}
                      className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-[#007A78] text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Topic</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {formMilestones.map((m, index) => (
                      <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={m.completed || false}
                            onChange={e => handleMilestoneChange(m.id, 'completed', e.target.checked)}
                            className="w-4 h-4 text-[#007A78] rounded cursor-pointer"
                          />
                        </label>

                        <input
                          type="text"
                          required
                          placeholder={`Topic ${index + 1}: e.g. Introduction & Definitions`}
                          value={m.topic}
                          onChange={e => handleMilestoneChange(m.id, 'topic', e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg font-semibold outline-none focus:border-[#007A78]"
                        />

                        <input
                          type="date"
                          value={m.startDate || ''}
                          onChange={e => handleMilestoneChange(m.id, 'startDate', e.target.value)}
                          className="w-28 px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg outline-none"
                          title="Target Date"
                        />

                        {formMilestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(m.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress Preview */}
                  <div className="pt-2 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Calculated Syllabus Progress:</span>
                    <span className={`px-2.5 py-0.5 rounded-full ${formProgress >= 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-teal-50 text-[#007A78]'}`}>
                      {formProgress}% ({formMilestones.filter(m => m.completed).length}/{formMilestones.length} Topics Completed)
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/80 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 text-xs font-black text-white bg-[#007A78] hover:bg-teal-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingForm ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingPlanId ? 'Save Changes' : 'Create Lesson Plan'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: QUICK UPDATE PROGRESS MODAL
         ========================================================================= */}
      {progressModalOpen && progressPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Update Syllabus Progress</h3>
                <p className="text-xs text-slate-400 font-medium truncate max-w-xs">{progressPlan.title}</p>
              </div>
              <button
                onClick={() => setProgressModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Topics Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Topics Completed Checklist
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                {tempMilestones.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    onClick={() => handleToggleTempMilestone(m.id)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-[#007A78] flex items-center gap-2.5 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={m.completed || false}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#007A78] rounded cursor-pointer"
                    />
                    <span className={`flex-1 font-semibold ${m.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {m.topic || m.unit || `Topic ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-700">Overall Progress</span>
                <span className={tempProgress >= 100 ? 'text-emerald-600' : 'text-[#007A78]'}>{tempProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempProgress}
                onChange={e => setTempProgress(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#007A78]"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setProgressModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingProgress}
                onClick={handleSaveProgressModal}
                className="px-4 py-2 text-xs font-black text-white bg-[#007A78] hover:bg-teal-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {updatingProgress ? <span>Saving...</span> : <span>Save Progress</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: VIEW PLAN DETAILS
         ========================================================================= */}
      {viewPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">
                    {viewPlan.className} &bull; {viewPlan.section}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-[#007A78] text-[11px] font-bold">
                    {viewPlan.subject}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">{viewPlan.title}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#007A78]" />
                  <span>Book: {viewPlan.chapterFolder || viewPlan.title}</span>
                </p>
              </div>
              <button
                onClick={() => setViewPlan(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider mb-1">Teaching Methodology</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{viewPlan.methodology}</p>
              </div>

              {viewPlan.description && (
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider mb-1">Description / Goals</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">{viewPlan.description}</p>
                </div>
              )}

              {/* Progress and Topics */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-[11px] uppercase tracking-wider">Syllabus Breakdown</span>
                  <span className="text-[#007A78] font-bold">{viewPlan.progress}% Completed</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {Array.isArray(viewPlan.milestones) && viewPlan.milestones.length > 0 ? (
                    viewPlan.milestones.map((m, idx) => (
                      <div key={m.id || idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                            m.completed ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                          }`}>
                            {m.completed && <Check className="w-3 h-3" />}
                          </span>
                          <span className={m.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                            {m.topic || m.unit || `Topic ${idx + 1}`}
                          </span>
                        </div>
                        {m.startDate && <span className="text-[11px] text-slate-400 font-normal">{m.startDate}</span>}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 font-medium italic">No detailed topics configured.</p>
                  )}
                </div>
              </div>

              {viewPlan.attachmentName && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Attachment</span>
                  <span className="text-[#007A78] font-bold flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{viewPlan.attachmentName}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewPlan(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: DELETE CONFIRMATION
         ========================================================================= */}
      {deletePlanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Delete Lesson Plan?</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-5">
              Are you sure you want to permanently remove this lesson plan? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletePlanId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePlanConfirm}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: DELETE BOOK TITLE CONFIRMATION
         ========================================================================= */}
      {deleteChapterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Delete Book Title?</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-5">
              Are you sure you want to delete this book title? Lesson plans inside will remain safe.
            </p>

            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteChapterId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteChapterConfirm}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

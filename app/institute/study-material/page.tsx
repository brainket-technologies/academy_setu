'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  BookOpen,
  GraduationCap,
  Layers,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Plus,
  Search,
  FileText,
  FileSpreadsheet,
  Presentation,
  Globe,
  Play,
  PlayCircle,
  Download,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  Folder,
  FolderPlus,
  Upload,
  RefreshCw,
  Eye,
  Link2,
  List
} from 'lucide-react'
import { getInstituteAddedClasses, MasterClassWithSections, normalizeClassName, normalizeSectionName } from '@/lib/institute-classes'

// ============================================================================
// TYPES
// ============================================================================
export type ContentType = 'pdf' | 'excel' | 'youtube' | 'ppt' | 'url'

export interface LessonFolder {
  id: string
  className: string
  section: string
  subject: string
  lessonName: string
  lessonNumber?: string
  description?: string
  color?: string
  materialCount?: number
  pdfCount?: number
  videoCount?: number
  excelCount?: number
  pptCount?: number
  urlCount?: number
  createdAt?: string
}

export interface StudyMaterial {
  id: string
  className: string
  section: string
  subject: string
  title: string
  contentType: ContentType
  chapterTopic: string
  lessonFolder?: string
  url: string
  fileName: string
  fileSize: string
  description: string
  allowDownload: boolean
  createdAt: string
}

interface MasterClassItem {
  className: string
  sections?: string[]
}

interface MasterSectionItem {
  sectionName: string
  className?: string
}

interface MasterSubjectItem {
  subjectName: string
  className?: string
  groupName?: string
}

// Helper to normalize and match section strings (e.g. 'A' vs 'Section A')
const checkSectionMatch = (secA: string, secB: string): boolean => {
  if (!secA || !secB) return false
  const a = secA.toLowerCase().trim().replace(/^section\s*/i, '')
  const b = secB.toLowerCase().trim().replace(/^section\s*/i, '')
  return a === b
}

// Helper to normalize and match class strings
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

// Cascading helper: Get Sections for a specific Class
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

// Cascading helper: Get Subjects for a specific Class
const getAvailableSubjectsForClass = (
  className: string,
  allSubjects: MasterSubjectItem[]
): string[] => {
  if (!className) return []

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
    'Computer Science'
  ]
}

// Helper to extract YouTube embed link
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11
    ? `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1`
    : null
}

export default function StudyMaterialPage() {
  // ── Top Level View Mode: 'folders' vs 'all-materials' ──
  const [viewMode, setViewMode] = useState<'folders' | 'all-materials'>('folders')

  // Hierarchical Drill-Down State for 'folders' mode
  // Level: 'classes' -> 'sections' -> 'subjects' -> 'lessons' -> 'content'
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)

  // Lesson Folders state
  const [lessons, setLessons] = useState<LessonFolder[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [lessonSearch, setLessonSearch] = useState('')

  // Create / Edit Lesson Modal State
  const [lessonModalOpen, setLessonModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<LessonFolder | null>(null)
  const [lessonFormClass, setLessonFormClass] = useState('')
  const [lessonFormSection, setLessonFormSection] = useState('')
  const [lessonFormSubject, setLessonFormSubject] = useState('')
  const [lessonFormName, setLessonFormName] = useState('')
  const [lessonFormNumber, setLessonFormNumber] = useState('')
  const [lessonFormDesc, setLessonFormDesc] = useState('')
  const [lessonFormColor, setLessonFormColor] = useState('teal')
  const [submittingLesson, setSubmittingLesson] = useState(false)
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null)

  // Data states
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [loading, setLoading] = useState(true)

  // Master Lists
  const [masterClasses, setMasterClasses] = useState<MasterClassItem[]>([])
  const [masterSections, setMasterSections] = useState<MasterSectionItem[]>([])
  const [masterSubjects, setMasterSubjects] = useState<MasterSubjectItem[]>([])

  // Filtering on Content Level & All Materials View
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all')
  const [filterClass, setFilterClass] = useState<string>('all')
  const [filterSection, setFilterSection] = useState<string>('all')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [filterLesson, setFilterLesson] = useState<string>('all')

  // Search on Class / Subject levels
  const [classSearch, setClassSearch] = useState('')
  const [subjectSearch, setSubjectSearch] = useState('')

  // Modals state
  const [addEditModalOpen, setAddEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StudyMaterial | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [youtubePlayerModal, setYoutubePlayerModal] = useState<{ open: boolean; item: StudyMaterial | null }>({
    open: false,
    item: null
  })

  // Add/Edit Form State
  const [formClass, setFormClass] = useState('')
  const [formSection, setFormSection] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formFolder, setFormFolder] = useState('')
  const [formNoFolder, setFormNoFolder] = useState(false)
  const [formNewFolderMode, setFormNewFolderMode] = useState(false)
  const [formType, setFormType] = useState<ContentType>('pdf')
  const [formTitle, setFormTitle] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formFileName, setFormFileName] = useState('')
  const [formFileSize, setFormFileSize] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formAllowDownload, setFormAllowDownload] = useState(true)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })

  // Quick Add Subject State
  const [quickAddSubjectOpen, setQuickAddSubjectOpen] = useState(false)
  const [quickSubName, setQuickSubName] = useState('')
  const [quickSubCode, setQuickSubCode] = useState('')
  const [quickSubGroup, setQuickSubGroup] = useState('Core Subject')
  const [quickSubScope, setQuickSubScope] = useState<'current' | 'selected' | 'all'>('current')
  const [quickSubSelectedClasses, setQuickSubSelectedClasses] = useState<string[]>([])
  const [quickSubError, setQuickSubError] = useState('')
  const [quickSubSubmitting, setQuickSubSubmitting] = useState(false)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500)
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

  // ── 2. Load ALL Study Materials ───────────────────────────────────────────
  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/institute/study-materials')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setMaterials(json.data)
      }
    } catch (e) {
      console.error('Error loading study materials:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  // ── 3. Load ALL Lesson Folders across the institute ────────────────────────
  const fetchLessons = useCallback(async () => {
    try {
      setLoadingLessons(true)
      const res = await fetch('/api/institute/study-materials/lessons')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setLessons(json.data)
      }
    } catch (e) {
      console.error('Error fetching lessons:', e)
    } finally {
      setLoadingLessons(false)
    }
  }, [])

  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

  // ── Merge Classes from Master, Lessons, and Materials ──────────────────────
  const unifiedClasses = useMemo(() => {
    const map = new Map<string, MasterClassItem>()

    // 1. Master classes first
    masterClasses.forEach(c => {
      const canonicalName = normalizeClassName(c.className)
      const key = canonicalName.toLowerCase().trim()
      if (!map.has(key)) {
        map.set(key, {
          className: canonicalName,
          sections: Array.isArray(c.sections) ? [...c.sections] : []
        })
      } else {
        const existing = map.get(key)!
        if (Array.isArray(c.sections)) {
          c.sections.forEach(s => {
            if (s && !existing.sections?.includes(s)) {
              existing.sections = [...(existing.sections || []), s]
            }
          })
        }
      }
    })

    // 2. Materials
    materials.forEach(m => {
      if (m.className) {
        const canonicalName = normalizeClassName(m.className)
        const key = canonicalName.toLowerCase().trim()
        if (map.has(key)) {
          const existing = map.get(key)!
          if (m.section && !existing.sections?.includes(m.section)) {
            existing.sections = [...(existing.sections || []), m.section]
          }
        } else {
          map.set(key, {
            className: canonicalName,
            sections: [m.section].filter(Boolean)
          })
        }
      }
    })

    // 3. Lessons
    lessons.forEach(l => {
      if (l.className) {
        const canonicalName = normalizeClassName(l.className)
        const key = canonicalName.toLowerCase().trim()
        if (map.has(key)) {
          const existing = map.get(key)!
          if (l.section && !existing.sections?.includes(l.section)) {
            existing.sections = [...(existing.sections || []), l.section]
          }
        } else {
          map.set(key, {
            className: canonicalName,
            sections: [l.section].filter(Boolean)
          })
        }
      }
    })

    // Sort naturally: Class 1, Class 2, Class 3, ... Class 10
    return Array.from(map.values()).sort((a, b) => {
      const numA = parseInt(a.className.replace(/\D/g, ''), 10)
      const numB = parseInt(b.className.replace(/\D/g, ''), 10)
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
        return numA - numB
      }
      return a.className.localeCompare(b.className, undefined, { numeric: true, sensitivity: 'base' })
    })
  }, [masterClasses, materials, lessons])

  // Dynamic Sections and Subjects based on selection
  const availableSections = useMemo(() => {
    if (!selectedClass) return []
    return getAvailableSectionsForClass(selectedClass, masterSections, unifiedClasses)
  }, [selectedClass, masterSections, unifiedClasses])

  const availableSubjects = useMemo(() => {
    if (!selectedClass) return []
    return getAvailableSubjectsForClass(selectedClass, masterSubjects)
  }, [selectedClass, masterSubjects])

  // Form Cascading Sections & Subjects
  const formAvailableSections = useMemo(() => {
    if (!formClass) return []
    return getAvailableSectionsForClass(formClass, masterSections, unifiedClasses)
  }, [formClass, masterSections, unifiedClasses])

  const formAvailableSubjects = useMemo(() => {
    if (!formClass) return []
    return getAvailableSubjectsForClass(formClass, masterSubjects)
  }, [formClass, masterSubjects])

  const formAvailableFolders = useMemo(() => {
    if (!formClass || !formSection || !formSubject) return []
    const set = new Set<string>()
    lessons.forEach(l => {
      if (
        checkClassMatch(l.className, formClass) &&
        checkSectionMatch(l.section, formSection) &&
        l.subject.toLowerCase().trim() === formSubject.toLowerCase().trim()
      ) {
        if (l.lessonName) set.add(l.lessonName.trim())
      }
    })
    materials.forEach(m => {
      if (
        checkClassMatch(m.className, formClass) &&
        checkSectionMatch(m.section, formSection) &&
        m.subject.toLowerCase().trim() === formSubject.toLowerCase().trim()
      ) {
        const f = (m.lessonFolder || m.chapterTopic || '').trim()
        if (f) set.add(f)
      }
    })
    return Array.from(set).sort()
  }, [formClass, formSection, formSubject, lessons, materials])

  // Filtered lists for view
  const filteredClasses = useMemo(() => {
    if (!classSearch.trim()) return unifiedClasses
    return unifiedClasses.filter(c => c.className.toLowerCase().includes(classSearch.toLowerCase().trim()))
  }, [unifiedClasses, classSearch])

  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return availableSubjects
    return availableSubjects.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase().trim()))
  }, [availableSubjects, subjectSearch])

  // Total materials for the chosen Subject
  const allSubjectMaterials = useMemo(() => {
    if (!selectedClass || !selectedSection || !selectedSubject) return []
    return materials.filter(m =>
      checkClassMatch(m.className, selectedClass) &&
      checkSectionMatch(m.section, selectedSection) &&
      m.subject.toLowerCase().trim() === selectedSubject.toLowerCase().trim()
    )
  }, [materials, selectedClass, selectedSection, selectedSubject])

  // Lessons list merged from DB and auto-discovered chapter topics in materials
  const currentSubjectLessons = useMemo(() => {
    if (!selectedClass || !selectedSection || !selectedSubject) return []

    const map = new Map<string, LessonFolder>()

    // 1. Lessons from DB
    lessons.forEach(l => {
      if (
        checkClassMatch(l.className, selectedClass) &&
        checkSectionMatch(l.section, selectedSection) &&
        l.subject.toLowerCase().trim() === selectedSubject.toLowerCase().trim()
      ) {
        map.set(l.lessonName.toLowerCase().trim(), l)
      }
    })

    // 2. Auto-discover from materials chapterTopic if not already in DB
    allSubjectMaterials.forEach(m => {
      const folderName = (m.lessonFolder || m.chapterTopic || '').trim()
      if (folderName && !map.has(folderName.toLowerCase())) {
        map.set(folderName.toLowerCase(), {
          id: `auto_${folderName}`,
          className: selectedClass,
          section: selectedSection,
          subject: selectedSubject,
          lessonName: folderName,
          lessonNumber: folderName.toLowerCase().startsWith('chapter') || folderName.toLowerCase().startsWith('unit') || folderName.toLowerCase().startsWith('lesson')
            ? folderName.split(':')[0].trim()
            : '',
          description: 'Study materials and learning resources',
          color: 'teal'
        })
      }
    })

    return Array.from(map.values())
  }, [lessons, allSubjectMaterials, selectedClass, selectedSection, selectedSubject])

  // Filtered lessons by search
  const filteredLessons = useMemo(() => {
    if (!lessonSearch.trim()) return currentSubjectLessons
    const q = lessonSearch.toLowerCase().trim()
    return currentSubjectLessons.filter(
      l =>
        l.lessonName.toLowerCase().includes(q) ||
        (l.lessonNumber && l.lessonNumber.toLowerCase().includes(q)) ||
        (l.description && l.description.toLowerCase().includes(q))
    )
  }, [currentSubjectLessons, lessonSearch])

  // Helper: get materials belonging to a specific lesson folder
  const getMaterialsForLesson = (lessonName: string) => {
    return allSubjectMaterials.filter(m => {
      const folder = (m.lessonFolder || m.chapterTopic || '').toLowerCase().trim()
      return folder === lessonName.toLowerCase().trim()
    })
  }

  // Materials inside currently selected lesson folder
  const currentSubjectMaterials = useMemo(() => {
    if (!selectedClass || !selectedSection || !selectedSubject) return []

    return allSubjectMaterials.filter(m => {
      if (selectedLesson) {
        const folder = (m.lessonFolder || m.chapterTopic || '').toLowerCase().trim()
        if (folder !== selectedLesson.toLowerCase().trim()) return false
      }

      if (selectedTypeFilter !== 'all' && m.contentType.toLowerCase() !== selectedTypeFilter.toLowerCase()) {
        return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesQuery =
          m.title.toLowerCase().includes(q) ||
          m.chapterTopic.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.fileName.toLowerCase().includes(q)
        if (!matchesQuery) return false
      }

      return true
    })
  }, [allSubjectMaterials, selectedClass, selectedSection, selectedSubject, selectedLesson, selectedTypeFilter, searchQuery])

  // Direct study materials attached directly to the chosen subject without any chapter folder
  const directSubjectMaterials = useMemo(() => {
    if (!selectedClass || !selectedSection || !selectedSubject) return []

    return allSubjectMaterials.filter(m => {
      const folder = (m.lessonFolder || m.chapterTopic || '').trim()
      if (folder) return false

      if (selectedTypeFilter !== 'all' && m.contentType.toLowerCase() !== selectedTypeFilter.toLowerCase()) {
        return false
      }

      if (lessonSearch.trim()) {
        const q = lessonSearch.toLowerCase().trim()
        const matchesQuery =
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.fileName.toLowerCase().includes(q)
        if (!matchesQuery) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesQuery =
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.fileName.toLowerCase().includes(q)
        if (!matchesQuery) return false
      }

      return true
    })
  }, [allSubjectMaterials, selectedClass, selectedSection, selectedSubject, selectedTypeFilter, lessonSearch, searchQuery])

  // ── Master "All Uploaded Materials" Filtered List ──────────────────────────
  const allMaterialsFiltered = useMemo(() => {
    return materials.filter(m => {
      if (filterClass !== 'all' && !checkClassMatch(m.className, filterClass)) return false
      if (filterSection !== 'all' && !checkSectionMatch(m.section, filterSection)) return false
      if (filterSubject !== 'all' && m.subject.toLowerCase().trim() !== filterSubject.toLowerCase().trim()) return false
      if (filterLesson !== 'all') {
        const f = (m.lessonFolder || m.chapterTopic || '').toLowerCase().trim()
        if (f !== filterLesson.toLowerCase().trim()) return false
      }
      if (selectedTypeFilter !== 'all' && m.contentType.toLowerCase() !== selectedTypeFilter.toLowerCase()) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        return (
          m.title.toLowerCase().includes(q) ||
          m.className.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.chapterTopic.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.fileName.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [materials, filterClass, filterSection, filterSubject, filterLesson, selectedTypeFilter, searchQuery])

  // Count helpers
  const getClassMaterialCount = (className: string) => {
    return materials.filter(m => checkClassMatch(m.className, className)).length
  }

  const getClassActiveSubjects = (className: string) => {
    const subs = new Set<string>()
    materials.filter(m => checkClassMatch(m.className, className)).forEach(m => subs.add(m.subject))
    return Array.from(subs)
  }

  const getSectionMaterialCount = (className: string, section: string) => {
    return materials.filter(m => checkClassMatch(m.className, className) && checkSectionMatch(m.section, section)).length
  }

  const getSubjectMaterialCount = (className: string, section: string, subject: string) => {
    return materials.filter(
      m =>
        checkClassMatch(m.className, className) &&
        checkSectionMatch(m.section, section) &&
        m.subject.toLowerCase().trim() === subject.toLowerCase().trim()
    ).length
  }

  // ── Open Create Lesson Modal ──────────────────────────────────────────────
  const openCreateLessonModal = (cName?: string, sName?: string, subName?: string) => {
    setEditingLesson(null)
    setLessonFormClass(cName || selectedClass || unifiedClasses[0]?.className || 'Class 1')
    setLessonFormSection(sName || selectedSection || 'Section A')
    setLessonFormSubject(subName || selectedSubject || 'English')
    setLessonFormName('')
    setLessonFormNumber('')
    setLessonFormDesc('')
    setLessonFormColor('teal')
    setLessonModalOpen(true)
  }

  // Open Edit Lesson Modal
  const openEditLessonModal = (les: LessonFolder) => {
    setEditingLesson(les)
    setLessonFormClass(les.className)
    setLessonFormSection(les.section)
    setLessonFormSubject(les.subject)
    setLessonFormName(les.lessonName)
    setLessonFormNumber(les.lessonNumber || '')
    setLessonFormDesc(les.description || '')
    setLessonFormColor(les.color || 'teal')
    setLessonModalOpen(true)
  }

  // Handle Save / Update Lesson Folder
  const handleSaveLessonFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = lessonFormName.trim()
    if (!trimmedName || !lessonFormClass || !lessonFormSection || !lessonFormSubject) {
      showToast('Please enter a folder name and select class/section/subject', 'error')
      return
    }

    // Pre-check for duplicate folder in same class, section, subject
    const isDup = lessons.some(l =>
      checkClassMatch(l.className, lessonFormClass) &&
      checkSectionMatch(l.section, lessonFormSection) &&
      l.subject.toLowerCase().trim() === lessonFormSubject.toLowerCase().trim() &&
      l.lessonName.toLowerCase().trim() === trimmedName.toLowerCase() &&
      l.id !== editingLesson?.id
    )

    if (isDup) {
      showToast(`A folder named "${trimmedName}" already exists in ${lessonFormClass} • ${normalizeSectionName(lessonFormSection)} • ${lessonFormSubject}.`, 'error')
      return
    }

    setSubmittingLesson(true)
    try {
      if (editingLesson && !editingLesson.id.startsWith('auto_')) {
        const res = await fetch(`/api/institute/study-materials/lessons/${editingLesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonName: trimmedName,
            lessonNumber: lessonFormNumber.trim(),
            description: lessonFormDesc.trim(),
            color: lessonFormColor
          })
        })
        const json = await res.json()
        if (json.success) {
          showToast(`Chapter folder renamed to "${trimmedName}"!`)
          setLessonModalOpen(false)
          if (selectedLesson === editingLesson.lessonName) {
            setSelectedLesson(trimmedName)
          }
          if (formFolder === editingLesson.lessonName) {
            setFormFolder(trimmedName)
          }
          setEditingLesson(null)
          fetchLessons()
          fetchMaterials()
        } else {
          showToast(json.error || 'Failed to update folder', 'error')
        }
      } else {
        const res = await fetch('/api/institute/study-materials/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            className: normalizeClassName(lessonFormClass),
            section: normalizeSectionName(lessonFormSection),
            subject: lessonFormSubject.trim(),
            lessonName: trimmedName,
            lessonNumber: lessonFormNumber.trim(),
            description: lessonFormDesc.trim(),
            color: lessonFormColor
          })
        })
        const json = await res.json()
        if (json.success) {
          showToast('Chapter folder created successfully!')
          setLessonModalOpen(false)
          fetchLessons()
        } else {
          showToast(json.error || 'Failed to create folder', 'error')
        }
      }
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'An error occurred', 'error')
    } finally {
      setSubmittingLesson(false)
    }
  }

  // Handle Delete Lesson Folder
  const handleDeleteLessonConfirm = async () => {
    if (!deleteLessonId) return
    try {
      const res = await fetch(`/api/institute/study-materials/lessons/${deleteLessonId}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (json.success) {
        showToast('Lesson folder deleted successfully!')
        setDeleteLessonId(null)
        if (selectedLesson) setSelectedLesson(null)
        fetchLessons()
        fetchMaterials()
      } else {
        showToast(json.error || 'Failed to delete folder', 'error')
      }
    } catch (err: any) {
      console.error(err)
      showToast('Error deleting folder', 'error')
    }
  }

  // ── Quick Add Subject Class-Wise ──────────────────────────────────────────
  const QUICK_SUBJECT_SUGGESTIONS = [
    'Mathematics',
    'Science',
    'Social Science',
    'English',
    'Hindi',
    'Sanskrit',
    'EVS',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Physical Education',
    'General Knowledge',
    'Arts & Craft',
    'Moral Science'
  ]

  const openQuickAddSubjectModal = () => {
    setQuickSubName('')
    setQuickSubCode('')
    setQuickSubGroup('Core Subject')
    setQuickSubScope('current')
    setQuickSubSelectedClasses([selectedClass || unifiedClasses[0]?.className || 'Class 1'])
    setQuickSubError('')
    setQuickAddSubjectOpen(true)
  }

  const handleQuickAddSubject = (e: React.FormEvent) => {
    e.preventDefault()
    setQuickSubError('')

    const trimmedName = quickSubName.trim()
    if (!trimmedName) {
      setQuickSubError('Please enter a subject name.')
      return
    }

    let targetClasses: string[] = []
    if (quickSubScope === 'current') {
      const cls = selectedClass || unifiedClasses[0]?.className || 'Class 1'
      targetClasses = [cls]
    } else if (quickSubScope === 'all') {
      targetClasses = unifiedClasses.map(c => c.className)
    } else {
      targetClasses = quickSubSelectedClasses
    }

    if (targetClasses.length === 0) {
      setQuickSubError('Please select at least one class.')
      return
    }

    setQuickSubSubmitting(true)
    try {
      let existing: any[] = []
      const raw = localStorage.getItem('school_masters_subjects')
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) existing = parsed
        } catch (err) {}
      }

      const nowTime =
        new Date().toLocaleDateString('en-GB') +
        ' ' +
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

      const newSubs = targetClasses.map((cls, idx) => ({
        id: Date.now() + idx,
        subjectCode: quickSubCode.trim() || `${trimmedName.slice(0, 3).toUpperCase()}-01`,
        subjectName: trimmedName,
        orderNo: existing.length + idx + 1,
        groupName: quickSubGroup || 'Core Subject',
        className: cls,
        streamName: 'General',
        type: 'Marks' as const,
        createdAt: nowTime,
        deleted: false,
        description: `Subject added for ${cls}`
      }))

      const updated = [...newSubs, ...existing]
      localStorage.setItem('school_masters_subjects', JSON.stringify(updated))

      // Sync state immediately so availableSubjects updates reactively
      setMasterSubjects(prev => [
        ...newSubs.map(s => ({
          subjectName: s.subjectName,
          className: s.className,
          groupName: s.groupName
        })),
        ...prev
      ])

      showToast(
        `Subject "${trimmedName}" added successfully for ${
          targetClasses.length === 1 ? targetClasses[0] : `${targetClasses.length} classes`
        }!`,
        'success'
      )
      setQuickAddSubjectOpen(false)
    } catch (err: any) {
      console.error(err)
      setQuickSubError(err.message || 'Failed to add subject.')
    } finally {
      setQuickSubSubmitting(false)
    }
  }

  // ── Open Add Material Modal ───────────────────────────────────────────────
  const openAddModal = (presetType?: ContentType, defaultFolder?: string, withoutFolder?: boolean) => {
    setEditingItem(null)
    const initialClass = selectedClass || (filterClass !== 'all' ? filterClass : (unifiedClasses[0]?.className || 'Class 1'))
    const initialSec = selectedSection || (filterSection !== 'all' ? filterSection : 'Section A')
    const initialSub = selectedSubject || (filterSubject !== 'all' ? filterSubject : 'English')
    const initialFld = defaultFolder || selectedLesson || (filterLesson !== 'all' ? filterLesson : '')

    setFormClass(initialClass)
    setFormSection(initialSec)
    setFormSubject(initialSub)
    setFormFolder(withoutFolder ? '' : initialFld)
    setFormNoFolder(withoutFolder || (!initialFld && !defaultFolder && !selectedLesson))
    setFormNewFolderMode(false)
    setFormType(presetType || 'pdf')
    setFormTitle('')
    setFormUrl('')
    setFormFileName('')
    setFormFileSize('')
    setFormDescription('')
    setFormAllowDownload(presetType !== 'youtube')
    setFormError('')
    setAddEditModalOpen(true)
  }

  // ── Open Edit Material Modal ──────────────────────────────────────────────
  const openEditModal = (item: StudyMaterial) => {
    setEditingItem(item)
    setFormClass(item.className)
    setFormSection(item.section)
    setFormSubject(item.subject)
    const fld = (item.lessonFolder || item.chapterTopic || '').trim()
    setFormFolder(fld)
    setFormNoFolder(!fld)
    setFormNewFolderMode(false)
    setFormType(item.contentType)
    setFormTitle(item.title)
    setFormUrl(item.url || '')
    setFormFileName(item.fileName || '')
    setFormFileSize(item.fileSize || '')
    setFormDescription(item.description || '')
    setFormAllowDownload(item.allowDownload)
    setFormError('')
    setAddEditModalOpen(true)
  }

  // ── Handle Add / Edit Submission ──────────────────────────────────────────
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!formClass || !formSection || !formSubject) {
      setFormError('Class, section, and subject must be selected.')
      return
    }

    if (!formTitle.trim()) {
      setFormError('Please enter a title for the study material.')
      return
    }

    if (!formUrl.trim()) {
      setFormError('Please enter a valid file link, YouTube link, or URL resource.')
      return
    }

    if (formType === 'youtube' && !getYouTubeEmbedUrl(formUrl.trim())) {
      setFormError('Please enter a valid YouTube video URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)')
      return
    }

    try {
      setFormSubmitting(true)
      let defaultFileName = formFileName.trim()
      let defaultFileSize = formFileSize.trim()

      if (!defaultFileName) {
        if (formType === 'pdf') defaultFileName = `${formTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
        else if (formType === 'excel') defaultFileName = `${formTitle.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
        else if (formType === 'ppt') defaultFileName = `${formTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`
        else if (formType === 'youtube') defaultFileName = 'YouTube Video Lecture'
        else defaultFileName = 'Web Resource Link'
      }

      if (!defaultFileSize) {
        if (formType === 'pdf') defaultFileSize = '2.5 MB'
        else if (formType === 'excel') defaultFileSize = '1.2 MB'
        else if (formType === 'ppt') defaultFileSize = '4.0 MB'
        else if (formType === 'youtube') defaultFileSize = 'Video Stream'
        else defaultFileSize = 'Web Resource'
      }

      const resolvedFolder = formNoFolder ? '' : formFolder.trim()
      const payload = {
        className: normalizeClassName(formClass),
        section: formSection,
        subject: formSubject,
        title: formTitle.trim(),
        contentType: formType,
        chapterTopic: resolvedFolder,
        lessonFolder: resolvedFolder,
        url: formUrl.trim(),
        fileName: defaultFileName,
        fileSize: defaultFileSize,
        description: formDescription.trim(),
        allowDownload: formType === 'youtube' ? false : formAllowDownload
      }

      if (editingItem) {
        const res = await fetch(`/api/institute/study-materials/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to update study material')
        }
        showToast('Study material updated successfully!')
      } else {
        const res = await fetch('/api/institute/study-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to add study material')
        }
        showToast(
          resolvedFolder
            ? `Study material added to "${resolvedFolder}"!`
            : `Study material added directly under ${formSubject}!`
        )
      }

      setAddEditModalOpen(false)
      fetchMaterials()
      fetchLessons()
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving.')
    } finally {
      setFormSubmitting(false)
    }
  }

  // ── Handle Delete Material ────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/institute/study-materials/${deletingId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showToast('Study material deleted successfully.')
        setMaterials(prev => prev.filter(m => m.id !== deletingId))
        fetchLessons()
      } else {
        showToast(data.error || 'Failed to delete material', 'error')
      }
    } catch (e: any) {
      showToast('Error deleting study material', 'error')
    } finally {
      setDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  // ── Content Type Icon & Badge ─────────────────────────────────────────────
  const renderTypeBadge = (type: ContentType) => {
    switch (type) {
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <FileText className="w-3.5 h-3.5" /> PDF
          </span>
        )
      case 'excel':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </span>
        )
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
            <Play className="w-3 h-3 fill-red-600 text-red-600" /> Video
          </span>
        )
      case 'ppt':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Presentation className="w-3.5 h-3.5" /> PPT
          </span>
        )
      case 'url':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Globe className="w-3.5 h-3.5" /> Web Link
          </span>
        )
    }
  }

  // ── Determine Current View Level in Curriculum Folders mode ───────────────
  const currentLevel = useMemo(() => {
    if (!selectedClass) return 'classes'
    if (!selectedSection) return 'sections'
    if (!selectedSubject) return 'subjects'
    if (!selectedLesson) return 'lessons'
    return 'content'
  }, [selectedClass, selectedSection, selectedSubject, selectedLesson])

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container - Full Screen Width */}
      <div className="w-full space-y-4">

        {/* ── TOP UNIFIED LOCATION NAVIGATION & FILTER BAR (FULL WIDTH) ────────── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-3.5 w-full">
          {/* Row 1: Dynamic Location Navigation Breadcrumbs + Add Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Dynamic Location Navigation Breadcrumbs (ALWAYS UPDATED) */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSelectedClass(null)
                  setSelectedSection(null)
                  setSelectedSubject(null)
                  setSelectedLesson(null)
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
                      setSelectedLesson(null)
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
                      setSelectedLesson(null)
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
                      setSelectedLesson(null)
                    }}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      currentLevel === 'lessons'
                        ? 'text-[#007A78] font-black bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{selectedSubject}</span>
                  </button>
                </>
              )}

              {selectedLesson && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="flex items-center gap-1.5 font-black text-[#007A78] bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                    <Folder className="w-3.5 h-3.5 text-[#007A78]" />
                    <span>Folder: {selectedLesson}</span>
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
                    if (currentLevel === 'content') setSelectedLesson(null)
                    else if (currentLevel === 'lessons') setSelectedSubject(null)
                    else if (currentLevel === 'subjects') setSelectedSection(null)
                    else if (currentLevel === 'sections') setSelectedClass(null)
                  }}
                  className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: View Switcher, Format Filters & Search Bar */}
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
                  onClick={() => setViewMode('all-materials')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'all-materials'
                      ? 'bg-white text-[#007A78] shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>All Materials ({materials.length})</span>
                </button>
              </div>

              {/* Format Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pdf', label: 'PDFs' },
                  { id: 'youtube', label: 'Videos' },
                  { id: 'excel', label: 'Sheets' },
                  { id: 'ppt', label: 'PPTs' },
                  { id: 'url', label: 'Links' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedTypeFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedTypeFilter === tab.id
                        ? 'bg-[#007A78] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Search Bar */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search materials, topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-[#007A78]"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            MODE 1: ALL ADDED MATERIALS VIEW (FULL WIDTH)
           ========================================================================= */}
        {viewMode === 'all-materials' && (
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
                      setFilterLesson('all')
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                  >
                    <option value="all">All Classes ({materials.length} files)</option>
                    {unifiedClasses.map(c => {
                      const count = getClassMaterialCount(c.className)
                      return (
                        <option key={c.className} value={c.className}>
                          {c.className} ({count} {count === 1 ? 'file' : 'files'})
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
                      setFilterLesson('all')
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                  >
                    <option value="all">All Sections</option>
                    {Array.from(new Set(materials.filter(m => filterClass === 'all' || checkClassMatch(m.className, filterClass)).map(m => m.section))).map(sec => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
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
                      setFilterLesson('all')
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                  >
                    <option value="all">All Subjects</option>
                    {Array.from(new Set(materials.filter(m => (filterClass === 'all' || checkClassMatch(m.className, filterClass)) && (filterSection === 'all' || m.section.toLowerCase() === filterSection.toLowerCase())).map(m => m.subject))).map(sub => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Filter Chapter Folder */}
                <div>
                  <label className="block text-slate-500 mb-1 text-[11px]">Chapter Folder</label>
                  <select
                    value={filterLesson}
                    onChange={e => setFilterLesson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                  >
                    <option value="all">All Chapter Folders</option>
                    {Array.from(new Set(materials.map(m => (m.lessonFolder || m.chapterTopic || '').trim()).filter(Boolean))).map(f => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Materials Cards List (Full Width) */}
            {allMaterialsFiltered.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm w-full">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#007A78] flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-slate-900">No Study Materials Match Criteria</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1 mb-5">
                  Try clearing your search filters or click below to upload study materials directly.
                </p>
                <button
                  type="button"
                  onClick={() => openAddModal()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#007A78] hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Study Material</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {allMaterialsFiltered.map(item => {
                  const isYouTube = item.contentType === 'youtube'
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-5">
                        {/* Location Breadcrumb Badge */}
                        <div className="mb-2.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex-wrap">
                            <span className="text-[#007A78] font-black">{item.className}</span>
                            <span>&bull;</span>
                            <span>{item.section}</span>
                            <span>&bull;</span>
                            <span className="text-slate-900">{item.subject}</span>
                            {item.chapterTopic && (
                              <>
                                <span>&bull;</span>
                                <span className="text-teal-700 font-semibold">{item.chapterTopic}</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Top row with format badge and edit/delete */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {renderTypeBadge(item.contentType)}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              title="Edit Material"
                              className="p-1.5 text-slate-400 hover:text-[#007A78] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingId(item.id)
                                setDeleteModalOpen(true)
                              }}
                              title="Delete Material"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 font-medium">
                            {item.description}
                          </p>
                        )}

                        {/* File details */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span className="truncate max-w-[170px]">
                            {item.fileName || item.contentType.toUpperCase()}
                          </span>
                          <span>{item.fileSize || 'Standard'}</span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {isYouTube ? (
                          <button
                            type="button"
                            onClick={() => setYoutubePlayerModal({ open: true, item })}
                            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Watch Video Lecture</span>
                          </button>
                        ) : (
                          <>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-[#007A78] hover:bg-teal-700 text-white rounded-xl transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>
                                {item.contentType === 'pdf'
                                  ? 'View PDF'
                                  : item.contentType === 'excel'
                                  ? 'Open Sheet'
                                  : item.contentType === 'ppt'
                                  ? 'View Slides'
                                  : 'Open Link'}
                              </span>
                            </a>
                            {item.allowDownload && (
                              <a
                                href={item.url}
                                download={item.fileName || true}
                                target="_blank"
                                rel="noreferrer"
                                title="Download File"
                                className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MODE 2: BROWSE CURRICULUM FOLDERS VIEW (FULL WIDTH CARD SYSTEM)
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
                      Select a class to browse sections, subjects, and study materials
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
                    const count = getClassMaterialCount(cls.className)
                    const activeSubs = getClassActiveSubjects(cls.className)
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
                              {count > 0 ? `${count} Materials` : '0 Materials'}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900 group-hover:text-[#007A78] transition-colors">
                            {cls.className}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 font-medium">
                            {sectionsList.length} {sectionsList.length === 1 ? 'Section' : 'Sections'}
                          </p>

                          {activeSubs.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {activeSubs.map(s => (
                                <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
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
                    Select a section to view its assigned subjects and learning materials
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableSections.map(sec => {
                    const count = getSectionMaterialCount(selectedClass!, sec)
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
                              {count} {count === 1 ? 'Material' : 'Materials'}
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
                      Select a subject to view chapter folders and learning resources
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
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
                    <button
                      type="button"
                      onClick={openQuickAddSubjectModal}
                      className="px-3.5 py-2 bg-[#007A78] hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Quick Add Subject</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredSubjects.map(sub => {
                    const count = getSubjectMaterialCount(selectedClass!, selectedSection!, sub)
                    return (
                      <div
                        key={sub}
                        onClick={() => {
                          setSelectedSubject(sub)
                          setSelectedLesson(null)
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
                              {count} {count === 1 ? 'Resource' : 'Resources'}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900 group-hover:text-[#007A78] transition-colors">
                            {sub}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 font-medium">
                            {selectedClass} &bull; {selectedSection}
                          </p>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#007A78]">
                          <span>View Chapter Folders</span>
                          <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Open <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  {/* Quick Add Subject Card at the end of the cards */}
                  <div
                    onClick={openQuickAddSubjectModal}
                    className="border-2 border-dashed border-slate-200 hover:border-[#007A78] bg-slate-50/60 hover:bg-teal-50/30 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group min-h-[160px]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#007A78] group-hover:bg-[#007A78] group-hover:text-white flex items-center justify-center transition-all mb-2.5 shadow-2xs">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-black text-slate-800 group-hover:text-[#007A78] transition-colors">
                      + Add Subject
                    </span>
                    <span className="text-xs text-slate-400 font-medium mt-0.5">
                      Assign to {selectedClass}
                    </span>
                  </div>
                </div>

                {filteredSubjects.length === 0 && (
                  <div className="py-8 text-center flex flex-col items-center justify-center space-y-2">
                    <p className="text-xs text-slate-400 font-semibold">
                      {subjectSearch
                        ? 'No subjects match your search keyword.'
                        : `No curriculum subjects found for ${selectedClass}.`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── LEVEL 4: LESSON / CHAPTER FOLDERS & DIRECT MATERIALS VIEW (FULL WIDTH CARD) ───────── */}
            {currentLevel === 'lessons' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 w-full space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 flex-wrap">
                      <span>Chapter Folders & Materials in {selectedSubject}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#007A78] text-[11px] font-black border border-teal-200">
                        {filteredLessons.length} {filteredLessons.length === 1 ? 'Folder' : 'Folders'}
                      </span>
                      {directSubjectMaterials.length > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200">
                          {directSubjectMaterials.length} Direct {directSubjectMaterials.length === 1 ? 'Material' : 'Materials'}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {selectedClass} &bull; {selectedSection} &bull; {allSubjectMaterials.length} total resources
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="relative w-48 sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search folders or materials..."
                        value={lessonSearch}
                        onChange={e => setLessonSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-[#007A78]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => openCreateLessonModal(selectedClass!, selectedSection!, selectedSubject!)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-[#007A78]" />
                      <span>+ Create Folder</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAddModal()}
                      className="px-3.5 py-2 bg-[#007A78] hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Material</span>
                    </button>
                  </div>
                </div>

                {filteredLessons.length === 0 && directSubjectMaterials.length === 0 ? (
                  <div className="py-12 sm:py-16 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#007A78] flex items-center justify-center shadow-2xs">
                      <FolderPlus className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-black text-slate-900">
                      No Chapter Folders or Materials in {selectedSubject} Yet
                    </h3>
                    <p className="text-xs text-slate-500 font-medium max-w-sm">
                      Upload study materials directly under {selectedSubject} without a folder, or create a chapter folder to organize by units.
                    </p>
                    <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
                      <button
                        type="button"
                        onClick={() => openAddModal(undefined, undefined, true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#007A78] hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Upload Material Without Folder</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openCreateLessonModal(selectedClass!, selectedSection!, selectedSubject!)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        <FolderPlus className="w-4 h-4 text-[#007A78]" />
                        <span>Create Chapter Folder</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Chapter Folders Grid (if any folders exist) */}
                    {filteredLessons.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Folder className="w-3.5 h-3.5 text-[#007A78]" />
                            <span>Chapter Folders</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {filteredLessons.map(lesson => {
                            const lessonMaterials = getMaterialsForLesson(lesson.lessonName)
                            const count = lessonMaterials.length
                            const pdfCount = lessonMaterials.filter(m => m.contentType === 'pdf').length
                            const videoCount = lessonMaterials.filter(m => m.contentType === 'youtube').length
                            const otherCount = count - pdfCount - videoCount

                            return (
                              <div
                                key={lesson.id || lesson.lessonName}
                                className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#007A78] transition-all flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div
                                      onClick={() => setSelectedLesson(lesson.lessonName)}
                                      className="w-12 h-12 rounded-xl bg-teal-50 text-[#007A78] group-hover:bg-[#007A78] group-hover:text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                                    >
                                      <Folder className="w-6 h-6" />
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-black uppercase ${
                                        count > 0 ? 'bg-teal-50 text-[#007A78]' : 'bg-slate-100 text-slate-500'
                                      }`}>
                                        {count} {count === 1 ? 'Resource' : 'Resources'}
                                      </span>
                                      {!lesson.id.startsWith('auto_') && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => openEditLessonModal(lesson)}
                                            title="Edit Folder Name"
                                            className="p-1 text-slate-400 hover:text-[#007A78] hover:bg-slate-100 rounded cursor-pointer"
                                          >
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setDeleteLessonId(lesson.id)}
                                            title="Delete Folder"
                                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <h3
                                    onClick={() => setSelectedLesson(lesson.lessonName)}
                                    className="text-base font-black text-slate-900 group-hover:text-[#007A78] transition-colors cursor-pointer"
                                  >
                                    {lesson.lessonName}
                                  </h3>

                                  <div className="flex flex-wrap gap-1 mt-2.5">
                                    {pdfCount > 0 && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                        <FileText className="w-3 h-3" /> {pdfCount} PDF
                                      </span>
                                    )}
                                    {videoCount > 0 && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                        <Play className="w-2.5 h-2.5 fill-red-600" /> {videoCount} Video
                                      </span>
                                    )}
                                    {otherCount > 0 && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                        +{otherCount} Other
                                      </span>
                                    )}
                                    {count === 0 && (
                                      <span className="text-[10.5px] text-slate-400 font-medium">Empty folder</span>
                                    )}
                                  </div>
                                </div>

                                <div
                                  onClick={() => setSelectedLesson(lesson.lessonName)}
                                  className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#007A78] cursor-pointer"
                                >
                                  <span>Open Folder Content</span>
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

                    {/* Notice if no chapter folders yet, but direct materials exist */}
                    {filteredLessons.length === 0 && directSubjectMaterials.length > 0 && (
                      <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-[#007A78] flex items-center justify-center shrink-0">
                            <FolderPlus className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">
                              No Chapter Folders Created Yet
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              All study materials below are attached directly under {selectedSubject}. You can create chapter folders anytime.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openCreateLessonModal(selectedClass!, selectedSection!, selectedSubject!)}
                          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                        >
                          <FolderPlus className="w-3.5 h-3.5 text-[#007A78]" />
                          <span>+ Create Chapter Folder</span>
                        </button>
                      </div>
                    )}

                    {/* ── Direct Study Materials (Without Folder) Section ──────── */}
                    {directSubjectMaterials.length > 0 && (
                      <div className={`space-y-3 ${filteredLessons.length > 0 ? 'pt-6 border-t border-slate-100' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#007A78]" />
                              <span>Direct Study Materials in {selectedSubject}</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#007A78] text-[11px] font-black border border-teal-200">
                                {directSubjectMaterials.length} {directSubjectMaterials.length === 1 ? 'Resource' : 'Resources'} (Without Folder)
                              </span>
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                              Materials attached directly to {selectedSubject} without a chapter folder
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => openAddModal(undefined, undefined, true)}
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#007A78] border border-teal-200 font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Direct Material</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                          {directSubjectMaterials.map(item => {
                            const isYouTube = item.contentType === 'youtube'
                            return (
                              <div
                                key={item.id}
                                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                              >
                                <div className="p-5">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-1.5">
                                      {renderTypeBadge(item.contentType)}
                                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                                        Direct
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => openEditModal(item)}
                                        title="Edit Material"
                                        className="p-1.5 text-slate-400 hover:text-[#007A78] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeletingId(item.id)
                                          setDeleteModalOpen(true)
                                        }}
                                        title="Delete Material"
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <h3 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
                                    {item.title}
                                  </h3>

                                  {item.description && (
                                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 font-medium">
                                      {item.description}
                                    </p>
                                  )}

                                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                                    <span className="truncate max-w-[170px]">
                                      {item.fileName || item.contentType.toUpperCase()}
                                    </span>
                                    <span>{item.fileSize || 'Standard'}</span>
                                  </div>
                                </div>

                                <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                  {isYouTube ? (
                                    <button
                                      type="button"
                                      onClick={() => setYoutubePlayerModal({ open: true, item })}
                                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-white" />
                                      <span>Watch Video Lecture</span>
                                    </button>
                                  ) : (
                                    <>
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-[#007A78] hover:bg-teal-700 text-white rounded-xl transition cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>
                                          {item.contentType === 'pdf'
                                            ? 'View PDF'
                                            : item.contentType === 'excel'
                                            ? 'Open Sheet'
                                            : item.contentType === 'ppt'
                                            ? 'View Slides'
                                            : 'Open Link'}
                                        </span>
                                      </a>
                                      {item.allowDownload && (
                                        <a
                                          href={item.url}
                                          download={item.fileName || true}
                                          target="_blank"
                                          rel="noreferrer"
                                          title="Download File"
                                          className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── LEVEL 5: STUDY MATERIAL CONTENT (FULL WIDTH CARD WITH SINGLE ADD BUTTON) ── */}
            {currentLevel === 'content' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 w-full space-y-6 animate-in fade-in duration-200">
                {/* Folder Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#007A78] flex items-center justify-center shrink-0 shadow-2xs">
                      <Folder className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">
                          Folder: {selectedLesson}
                        </h2>
                        <button
                          type="button"
                          onClick={() => {
                            const matched = filteredLessons.find(
                              l => l.lessonName.toLowerCase().trim() === selectedLesson?.toLowerCase().trim()
                            )
                            if (matched) {
                              openEditLessonModal(matched)
                            } else {
                              openCreateLessonModal(selectedClass!, selectedSection!, selectedSubject!)
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Rename Chapter Folder"
                        >
                          <Pencil className="w-3 h-3 text-[#007A78]" />
                          <span>Rename Folder</span>
                        </button>
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#007A78] text-[11px] font-black border border-teal-200">
                          {currentSubjectMaterials.length} {currentSubjectMaterials.length === 1 ? 'Resource' : 'Resources'}
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
                      onClick={() => openAddModal(undefined, selectedLesson!)}
                      className="px-4 py-2.5 bg-[#007A78] hover:bg-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Study Material</span>
                    </button>
                  </div>
                </div>

                {/* Content Inside Folder */}
                {currentSubjectMaterials.length === 0 ? (
                  /* Clean Full Width Empty State (No 5 separate icons, just 1 clear Add button) */
                  <div className="py-12 sm:py-16 text-center flex flex-col items-center justify-center space-y-3 w-full">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#007A78] flex items-center justify-center shadow-2xs">
                      <Folder className="w-8 h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      No Study Materials in &ldquo;{selectedLesson}&rdquo;
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm max-w-md font-medium">
                      This chapter folder is currently empty. Click the button below to upload notes, video lecture links, spreadsheets, or documents.
                    </p>
                    <button
                      type="button"
                      onClick={() => openAddModal(undefined, selectedLesson!)}
                      className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#007A78] hover:bg-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Study Material</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {currentSubjectMaterials.map(item => {
                      const isYouTube = item.contentType === 'youtube'
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                        >
                          <div className="p-5">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              {renderTypeBadge(item.contentType)}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(item)}
                                  title="Edit Material"
                                  className="p-1.5 text-slate-400 hover:text-[#007A78] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeletingId(item.id)
                                    setDeleteModalOpen(true)
                                  }}
                                  title="Delete Material"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h3 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
                              {item.title}
                            </h3>

                            {item.description && (
                              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 font-medium">
                                {item.description}
                              </p>
                            )}

                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                              <span className="truncate max-w-[170px]">
                                {item.fileName || item.contentType.toUpperCase()}
                              </span>
                              <span>{item.fileSize || 'Standard'}</span>
                            </div>
                          </div>

                          <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            {isYouTube ? (
                              <button
                                type="button"
                                onClick={() => setYoutubePlayerModal({ open: true, item })}
                                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Watch Video Lecture</span>
                              </button>
                            ) : (
                              <>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-[#007A78] hover:bg-teal-700 text-white rounded-xl transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>
                                    {item.contentType === 'pdf'
                                      ? 'View PDF'
                                      : item.contentType === 'excel'
                                      ? 'Open Sheet'
                                      : item.contentType === 'ppt'
                                      ? 'View Slides'
                                      : 'Open Link'}
                                  </span>
                                </a>
                                {item.allowDownload && (
                                  <a
                                    href={item.url}
                                    download={item.fileName || true}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Download File"
                                    className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </>
                            )}
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

      {/* ── MODAL 1: ADD / EDIT STUDY MATERIAL ─────────────────────────────── */}
      {addEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Header (shrink-0) */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>{editingItem ? 'Edit Study Material' : 'Upload Study Material'}</span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#007A78] text-[10.5px] font-bold">
                    Curriculum File
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Attach curriculum notes, YouTube video lectures, spreadsheets, or reference links.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddEditModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveMaterial} className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs font-semibold">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Navigation Trail (Locked Class, Section, Subject) */}
                <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                      Curriculum Location:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs">
                      <GraduationCap className="w-3.5 h-3.5 text-[#007A78]" />
                      <span>{formClass || 'Class 1'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs">
                      <Layers className="w-3.5 h-3.5 text-[#007A78]" />
                      <span>{formSection || 'Section A'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-black text-[#007A78] shadow-2xs">
                      <BookOpen className="w-3.5 h-3.5 text-[#007A78]" />
                      <span>{formSubject || 'English'}</span>
                    </span>
                  </div>
                </div>

                {/* 2. Chapter Folder Selector / Without Folder Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold flex items-center gap-1.5">
                      <span>Organization Mode</span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        (Choose folder or direct)
                      </span>
                    </label>
                  </div>

                  {/* Mode Selector: Direct / Without Folder vs Chapter Folder */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setFormNoFolder(true)
                        setFormFolder('')
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        formNoFolder
                          ? 'bg-white text-[#007A78] shadow-xs font-black border border-teal-100'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Without Folder (Direct)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormNoFolder(false)
                        if (!formFolder && formAvailableFolders.length > 0) {
                          setFormFolder(formAvailableFolders[0])
                        }
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        !formNoFolder
                          ? 'bg-white text-[#007A78] shadow-xs font-black border border-teal-100'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5" />
                      <span>In Chapter Folder</span>
                    </button>
                  </div>

                  {formNoFolder ? (
                    <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#007A78] shrink-0" />
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            Adding directly to {formSubject || 'Subject'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            No chapter folder needed. Material will appear directly on the subject page.
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-teal-100 text-[#007A78] text-[10.5px] font-black shrink-0">
                        Direct Resource
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600">
                          Chapter Folder Name <span className="text-slate-400 font-normal">(Optional)</span>:
                        </span>
                        {formFolder && (
                          <button
                            type="button"
                            onClick={() => {
                              const matched = filteredLessons.find(
                                l => l.lessonName.toLowerCase().trim() === formFolder.toLowerCase().trim()
                              )
                              if (matched) {
                                openEditLessonModal(matched)
                              } else {
                                openCreateLessonModal(formClass, formSection, formSubject)
                              }
                            }}
                            className="text-[11px] font-bold text-[#007A78] hover:underline cursor-pointer flex items-center gap-1"
                            title="Rename this folder in database"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Rename chapter folder</span>
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Type chapter folder name or select an existing one below..."
                          value={formFolder}
                          onChange={e => {
                            setFormFolder(e.target.value)
                            setFormNoFolder(false)
                          }}
                          list="available-folders-datalist"
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#007A78]"
                        />
                        <datalist id="available-folders-datalist">
                          {formAvailableFolders.map(fld => (
                            <option key={fld} value={fld} />
                          ))}
                        </datalist>
                      </div>

                      {/* Quick Pick Existing Folder Pills */}
                      {formAvailableFolders.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10.5px] text-slate-400 font-semibold">Existing Folders:</span>
                          {formAvailableFolders.map(fld => (
                            <button
                              key={fld}
                              type="button"
                              onClick={() => {
                                setFormFolder(fld)
                                setFormNoFolder(false)
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                                formFolder.toLowerCase().trim() === fld.toLowerCase().trim()
                                  ? 'bg-teal-50 text-[#007A78] border border-teal-200 font-black shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <Folder className="w-3 h-3 text-[#007A78]" />
                              <span>{fld}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Content Type Selector */}
                <div>
                  <label className="block text-slate-600 mb-1.5 font-bold">
                    Content Format Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { type: 'pdf' as ContentType, label: 'PDF Document', icon: FileText, color: 'text-rose-600', activeBg: 'bg-rose-50 border-rose-300 text-rose-800' },
                      { type: 'excel' as ContentType, label: 'Excel Sheet', icon: FileSpreadsheet, color: 'text-emerald-600', activeBg: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
                      { type: 'youtube' as ContentType, label: 'YouTube Video', icon: PlayCircle, color: 'text-red-600', activeBg: 'bg-red-50 border-red-300 text-red-800' },
                      { type: 'ppt' as ContentType, label: 'PPT Slides', icon: Presentation, color: 'text-amber-600', activeBg: 'bg-amber-50 border-amber-300 text-amber-800' },
                      { type: 'url' as ContentType, label: 'Web Link', icon: Globe, color: 'text-cyan-600', activeBg: 'bg-cyan-50 border-cyan-300 text-cyan-800' }
                    ].map(tab => {
                      const Icon = tab.icon
                      const isSelected = formType === tab.type
                      return (
                        <button
                          key={tab.type}
                          type="button"
                          onClick={() => {
                            setFormType(tab.type)
                            if (tab.type === 'youtube') setFormAllowDownload(false)
                          }}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                            isSelected
                              ? `${tab.activeBg} font-black shadow-2xs`
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${tab.color}`} />
                          <span className="text-[11px] leading-tight">{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 4. Material Title */}
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">
                    Material Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      formType === 'youtube'
                        ? 'e.g. Factorization & Parabolic Roots Video Lecture'
                        : 'e.g. Complete Revision Formula Notes & Solved Papers'
                    }
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#007A78]"
                  />
                </div>

                {/* 5. File / URL Link & Choose File */}
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">
                    {formType === 'youtube'
                      ? 'YouTube Video Link *'
                      : formType === 'url'
                      ? 'Website Resource URL *'
                      : 'File Link or Upload *'}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        required
                        placeholder={
                          formType === 'youtube'
                            ? 'https://www.youtube.com/watch?v=... or https://youtu.be/...'
                            : formType === 'pdf'
                            ? 'https://example.com/notes.pdf'
                            : formType === 'excel'
                            ? 'https://example.com/sheet.xlsx'
                            : formType === 'ppt'
                            ? 'https://example.com/presentation.pptx'
                            : 'https://example.com/resource'
                        }
                        value={formUrl}
                        onChange={e => setFormUrl(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#007A78]"
                      />
                      <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {formType !== 'youtube' && formType !== 'url' && (
                      <label className="shrink-0 cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 transition flex items-center justify-center gap-1.5 shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-[#007A78]" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          className="hidden"
                          accept={
                            formType === 'pdf'
                              ? '.pdf'
                              : formType === 'excel'
                              ? '.xlsx,.xls,.csv'
                              : '.ppt,.pptx'
                          }
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setFormFileName(file.name)
                              const sizeInMb = (file.size / (1024 * 1024)).toFixed(1)
                              setFormFileSize(`${sizeInMb} MB`)
                              if (!formTitle.trim()) {
                                setFormTitle(file.name.replace(/\.[^/.]+$/, ''))
                              }
                              setFormUrl(`https://storage.institute.edu/materials/${file.name}`)
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {formFileName && (
                    <div className="text-[11px] text-teal-700 font-bold mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Selected: {formFileName} {formFileSize ? `(${formFileSize})` : ''}</span>
                    </div>
                  )}
                </div>

                {/* 6. Description */}
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">
                    Description / Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief notes or instructions for students..."
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-[#007A78] resize-none"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 px-6 py-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-end gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#007A78] hover:bg-teal-700 text-white font-black text-xs shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {formSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingItem ? 'Save Changes' : 'Upload Material'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: YOUTUBE VIDEO LECTURE PLAYER ──────────────────────────── */}
      {youtubePlayerModal.open && youtubePlayerModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-red-500 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black truncate max-w-md">
                    {youtubePlayerModal.item.title}
                  </h3>
                  <div className="text-xs text-slate-400 font-medium">
                    {youtubePlayerModal.item.chapterTopic || 'Video Lecture'} &bull; {youtubePlayerModal.item.subject}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setYoutubePlayerModal({ open: false, item: null })}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              {getYouTubeEmbedUrl(youtubePlayerModal.item.url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(youtubePlayerModal.item.url)!}
                  title={youtubePlayerModal.item.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                  <AlertCircle className="w-10 h-10 mb-2 text-amber-500" />
                  <p className="text-sm font-bold">Unable to parse YouTube video URL.</p>
                  <a
                    href={youtubePlayerModal.item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                  >
                    Open on YouTube Directly
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate max-w-md">
                {youtubePlayerModal.item.description || 'Interactive institute video lecture.'}
              </span>
              <a
                href={youtubePlayerModal.item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-red-400 hover:text-red-300"
              >
                Open in YouTube <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DELETE STUDY MATERIAL CONFIRMATION ─────────────────────── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Delete Study Material?</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-5">
              Are you sure you want to permanently remove this study material? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false)
                  setDeletingId(null)
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: CREATE / EDIT LESSON FOLDER ────────────────────────── */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-teal-50 to-white border-b border-teal-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#007A78] text-white flex items-center justify-center shadow-xs">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingLesson ? 'Edit Chapter Folder' : 'Create Chapter Folder'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {lessonFormClass} &bull; {lessonFormSection} &bull; {lessonFormSubject}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLessonModalOpen(false)
                  setEditingLesson(null)
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLessonFolder} className="p-5 space-y-4 text-xs font-semibold">
              {/* Navigation Trail (Locked Class, Section, Subject) */}
              <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                  Target Location:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs">
                    <GraduationCap className="w-3.5 h-3.5 text-[#007A78]" />
                    <span>{lessonFormClass || 'Class 1'}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs">
                    <Layers className="w-3.5 h-3.5 text-[#007A78]" />
                    <span>{lessonFormSection || 'Section A'}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-black text-[#007A78] shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5 text-[#007A78]" />
                    <span>{lessonFormSubject || 'English'}</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">
                  Chapter / Folder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: Introduction or Chemical Reactions"
                  value={lessonFormName}
                  onChange={e => setLessonFormName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#007A78]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">
                  Folder Theme Color
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
                      onClick={() => setLessonFormColor(c.id)}
                      className={`w-7 h-7 rounded-full ${c.bg} transition-all flex items-center justify-center cursor-pointer ${
                        lessonFormColor === c.id ? 'ring-2 ring-offset-2 ring-[#007A78] scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {lessonFormColor === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setLessonModalOpen(false)
                    setEditingLesson(null)
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLesson}
                  className="px-5 py-2 text-xs font-black bg-[#007A78] hover:bg-teal-700 text-white rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingLesson ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingLesson ? 'Update Folder' : 'Create Folder'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 5: DELETE LESSON FOLDER CONFIRMATION ───────────────────── */}
      {deleteLessonId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Delete Lesson Folder?</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-5">
              Are you sure you want to delete this folder? Any study materials inside will remain in the subject catalog.
            </p>

            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteLessonId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLessonConfirm}
                className="px-5 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 6: QUICK ADD SUBJECT (CLASS-WISE) ─────────────────────── */}
      {quickAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-teal-50/60 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#007A78] text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Quick Add Subject</h3>
                  <p className="text-xs text-slate-400 font-medium">Class-wise curriculum configuration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddSubjectOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleQuickAddSubject} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
              {quickSubError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{quickSubError}</span>
                </div>
              )}

              {/* Class-wise Selection */}
              <div>
                <label className="block text-slate-600 mb-1.5 font-bold uppercase tracking-wide text-[10.5px]">
                  Target Class(es) *
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickSubScope('current')
                      setQuickSubSelectedClasses([selectedClass || unifiedClasses[0]?.className || 'Class 1'])
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer ${
                      quickSubScope === 'current'
                        ? 'bg-white text-[#007A78] shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {selectedClass || 'Class 1'} Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickSubScope('selected')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer ${
                      quickSubScope === 'selected'
                        ? 'bg-white text-[#007A78] shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Specific Classes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickSubScope('all')
                      setQuickSubSelectedClasses(unifiedClasses.map(c => c.className))
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer ${
                      quickSubScope === 'all'
                        ? 'bg-white text-[#007A78] shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Classes
                  </button>
                </div>

                {/* If Specific Classes chosen, show pills */}
                {quickSubScope === 'selected' && (
                  <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Select Classes:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuickSubSelectedClasses(unifiedClasses.map(c => c.className))}
                          className="text-[#007A78] hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span>&bull;</span>
                        <button
                          type="button"
                          onClick={() => setQuickSubSelectedClasses([])}
                          className="text-slate-400 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {unifiedClasses.map(cls => {
                        const isSelected = quickSubSelectedClasses.includes(cls.className)
                        return (
                          <button
                            key={cls.className}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setQuickSubSelectedClasses(prev => prev.filter(c => c !== cls.className))
                              } else {
                                setQuickSubSelectedClasses(prev => [...prev, cls.className])
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-teal-50 text-[#007A78] border border-teal-200 font-black'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-[#007A78]" />}
                            <span>{cls.className}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Name */}
              <div>
                <label className="block text-slate-600 mb-1 font-bold">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Science, Computer..."
                  value={quickSubName}
                  onChange={e => {
                    setQuickSubName(e.target.value)
                    if (!quickSubCode.trim() && e.target.value.trim()) {
                      setQuickSubCode(`${e.target.value.trim().slice(0, 3).toUpperCase()}-01`)
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                  autoFocus
                />

                {/* Quick Subject Suggestion Pills */}
                <div className="mt-2.5">
                  <span className="block text-[10.5px] font-bold text-slate-400 mb-1.5">
                    Quick Pick Popular Subjects:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {QUICK_SUBJECT_SUGGESTIONS.map(s => {
                      const isCurrent = quickSubName.toLowerCase().trim() === s.toLowerCase().trim()
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setQuickSubName(s)
                            setQuickSubCode(`${s.slice(0, 3).toUpperCase()}-01`)
                          }}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                            isCurrent
                              ? 'bg-teal-50 text-[#007A78] border border-teal-200 font-black shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          + {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Subject Code (Optional) & Category */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">
                    Subject Code <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MATH-01"
                    value={quickSubCode}
                    onChange={e => setQuickSubCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">
                    Subject Group
                  </label>
                  <select
                    value={quickSubGroup}
                    onChange={e => setQuickSubGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#007A78]"
                  >
                    <option value="Core Subject">Core Subject</option>
                    <option value="Language">Language</option>
                    <option value="Science / Technical">Science / Technical</option>
                    <option value="Activity / Arts">Activity / Arts</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuickAddSubjectOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickSubSubmitting || !quickSubName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#007A78] hover:bg-teal-700 text-white text-xs font-black transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{quickSubSubmitting ? 'Adding Subject...' : 'Save Subject'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

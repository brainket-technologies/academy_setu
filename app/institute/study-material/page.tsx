'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  BookOpen,
  GraduationCap,
  Layers,
  ChevronRight,
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
  FolderOpen,
  Sliders,
  Filter,
  Sparkles,
  Upload,
  RefreshCw,
  Eye,
  Link2
} from 'lucide-react'
import { getInstituteAddedClasses, MasterClassWithSections } from '@/lib/institute-classes'

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

// Helper to normalize and match class strings
const checkClassMatch = (classA: string, classB: string): boolean => {
  if (!classA || !classB) return false
  const a = classA.toLowerCase().trim()
  const b = classB.toLowerCase().trim()
  if (a === b) return true
  const numA = a.replace(/[^0-9]/g, '')
  const numB = b.replace(/[^0-9]/g, '')
  if (numA && numB && numA === numB) return true
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
  // Navigation / Hierarchical Drill-Down State
  // Level: 'classes' -> 'sections' -> 'subjects' -> 'content'
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
  const [lessonFormName, setLessonFormName] = useState('')
  const [lessonFormNumber, setLessonFormNumber] = useState('')
  const [lessonFormDesc, setLessonFormDesc] = useState('')
  const [lessonFormColor, setLessonFormColor] = useState('teal')
  const [submittingLesson, setSubmittingLesson] = useState(false)
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null)

  // Data states
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [materialsLoading, setMaterialsLoading] = useState(false)

  // Master Lists
  const [masterClasses, setMasterClasses] = useState<MasterClassItem[]>([])
  const [masterSections, setMasterSections] = useState<MasterSectionItem[]>([])
  const [masterSubjects, setMasterSubjects] = useState<MasterSubjectItem[]>([])

  // Filtering on Content Level
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all')

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
  const [formType, setFormType] = useState<ContentType>('pdf')
  const [formTitle, setFormTitle] = useState('')
  const [formChapterTopic, setFormChapterTopic] = useState('')
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
      console.error(e)
    }

    if (loadedClasses.length === 0) {
      try {
        const fallback = getInstituteAddedClasses()
        loadedClasses = fallback.map(f => ({ className: f.className, sections: f.sections }))
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

  // ── 1.5 Load Lesson Folders for selected Subject ──────────────────────────
  const fetchLessons = useCallback(async () => {
    if (!selectedClass || !selectedSection || !selectedSubject) {
      setLessons([])
      return
    }
    try {
      setLoadingLessons(true)
      const params = new URLSearchParams({
        className: selectedClass,
        section: selectedSection,
        subject: selectedSubject
      })
      const res = await fetch(`/api/institute/study-materials/lessons?${params.toString()}`)
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setLessons(json.data)
      }
    } catch (e) {
      console.error('Error fetching lessons:', e)
    } finally {
      setLoadingLessons(false)
    }
  }, [selectedClass, selectedSection, selectedSubject])

  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

  // Open Create Lesson Modal
  const openCreateLessonModal = () => {
    setEditingLesson(null)
    setLessonFormName('')
    setLessonFormNumber('')
    setLessonFormDesc('')
    setLessonFormColor('teal')
    setLessonModalOpen(true)
  }

  // Open Edit Lesson Modal
  const openEditLessonModal = (les: LessonFolder) => {
    setEditingLesson(les)
    setLessonFormName(les.lessonName)
    setLessonFormNumber(les.lessonNumber || '')
    setLessonFormDesc(les.description || '')
    setLessonFormColor(les.color || 'teal')
    setLessonModalOpen(true)
  }

  // Handle Save / Update Lesson Folder
  const handleSaveLessonFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lessonFormName.trim() || !selectedClass || !selectedSection || !selectedSubject) {
      showToast('Please enter a chapter name', 'error')
      return
    }

    setSubmittingLesson(true)
    try {
      if (editingLesson && !editingLesson.id.startsWith('auto_')) {
        const res = await fetch(`/api/institute/study-materials/lessons/${editingLesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonName: lessonFormName.trim(),
            lessonNumber: '',
            description: '',
            color: lessonFormColor
          })
        })
        const json = await res.json()
        if (json.success) {
          showToast('Chapter folder updated successfully!')
          setLessonModalOpen(false)
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
            className: selectedClass,
            section: selectedSection,
            subject: selectedSubject,
            lessonName: lessonFormName.trim(),
            lessonNumber: '',
            description: '',
            color: lessonFormColor
          })
        })
        const json = await res.json()
        if (json.success) {
          showToast('Chapter folder created successfully!')
          setLessonModalOpen(false)
          setLessonFormName('')
          setLessonFormNumber('')
          setLessonFormDesc('')
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
        fetchLessons()
      } else {
        showToast(json.error || 'Failed to delete folder', 'error')
      }
    } catch (err: any) {
      console.error(err)
      showToast('Error deleting folder', 'error')
    }
  }

  // ── 2. Load Study Materials ───────────────────────────────────────────────
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

  // ── Dynamic Sections and Subjects based on selection ─────────────────────
  const availableSections = useMemo(() => {
    if (!selectedClass) return []
    return getAvailableSectionsForClass(selectedClass, masterSections, masterClasses)
  }, [selectedClass, masterSections, masterClasses])

  const availableSubjects = useMemo(() => {
    if (!selectedClass) return []
    return getAvailableSubjectsForClass(selectedClass, masterSubjects)
  }, [selectedClass, masterSubjects])

  // Filtered lists for view
  const filteredClasses = useMemo(() => {
    if (!classSearch.trim()) return masterClasses
    return masterClasses.filter(c => c.className.toLowerCase().includes(classSearch.toLowerCase().trim()))
  }, [masterClasses, classSearch])

  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return availableSubjects
    return availableSubjects.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase().trim()))
  }, [availableSubjects, subjectSearch])

  // Total materials for the chosen Subject (regardless of lesson filter)
  const allSubjectMaterials = useMemo(() => {
    if (!selectedClass || !selectedSection || !selectedSubject) return []
    return materials.filter(m =>
      checkClassMatch(m.className, selectedClass) &&
      m.section.toLowerCase() === selectedSection.toLowerCase() &&
      m.subject.toLowerCase() === selectedSubject.toLowerCase()
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
        l.section.toLowerCase() === selectedSection.toLowerCase() &&
        l.subject.toLowerCase() === selectedSubject.toLowerCase()
      ) {
        map.set(l.lessonName.toLowerCase().trim(), l)
      }
    })

    // 2. Auto-discover from materials chapterTopic if not already in DB
    allSubjectMaterials.forEach(m => {
      const folderName = (m.chapterTopic || (m as any).lessonFolder || '').trim()
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
          description: 'Study materials, notes, and resources',
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
      const folder = (m.chapterTopic || (m as any).lessonFolder || '').toLowerCase().trim()
      return folder === lessonName.toLowerCase().trim()
    })
  }

  // Materials inside currently selected lesson folder (Content level)
  const currentSubjectMaterials = useMemo(() => {
    if (!selectedClass || !selectedSection || !selectedSubject) return []

    return allSubjectMaterials.filter(m => {
      if (selectedLesson) {
        const folder = (m.chapterTopic || (m as any).lessonFolder || '').toLowerCase().trim()
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

  // Helper counts
  const getClassMaterialCount = (className: string) => {
    return materials.filter(m => checkClassMatch(m.className, className)).length
  }

  const getSectionMaterialCount = (className: string, section: string) => {
    return materials.filter(m => checkClassMatch(m.className, className) && m.section.toLowerCase() === section.toLowerCase()).length
  }

  const getSubjectMaterialCount = (className: string, section: string, subject: string) => {
    return materials.filter(
      m =>
        checkClassMatch(m.className, className) &&
        m.section.toLowerCase() === section.toLowerCase() &&
        m.subject.toLowerCase() === subject.toLowerCase()
    ).length
  }

  // ── Open Add Modal ────────────────────────────────────────────────────────
  const openAddModal = (presetType?: ContentType) => {
    setEditingItem(null)
    setFormType(presetType || 'pdf')
    setFormTitle('')
    setFormChapterTopic(selectedLesson || '')
    setFormUrl('')
    setFormFileName('')
    setFormFileSize('')
    setFormDescription('')
    setFormAllowDownload(presetType !== 'youtube')
    setFormError('')
    setAddEditModalOpen(true)
  }

  // ── Open Edit Modal ───────────────────────────────────────────────────────
  const openEditModal = (item: StudyMaterial) => {
    setEditingItem(item)
    setFormType(item.contentType)
    setFormTitle(item.title)
    setFormChapterTopic(item.chapterTopic || '')
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

    if (!selectedClass || !selectedSection || !selectedSubject) {
      setFormError('Class, section, and subject must be selected.')
      return
    }

    if (!formTitle.trim()) {
      setFormError('Please enter a title for the study material.')
      return
    }

    if (!formUrl.trim()) {
      setFormError('Please enter a valid file link, YouTube link, or URL.')
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

      const resolvedLessonFolder = formChapterTopic.trim() || selectedLesson || ''
      const payload = {
        className: selectedClass,
        section: selectedSection,
        subject: selectedSubject,
        title: formTitle.trim(),
        contentType: formType,
        chapterTopic: resolvedLessonFolder,
        lessonFolder: resolvedLessonFolder,
        url: formUrl.trim(),
        fileName: defaultFileName,
        fileSize: defaultFileSize,
        description: formDescription.trim(),
        allowDownload: formType === 'youtube' ? false : formAllowDownload
      }

      if (editingItem) {
        // PUT update
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
        // POST create
        const res = await fetch('/api/institute/study-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to add study material')
        }
        showToast('Study material added successfully!')
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

  // ── Handle Delete ─────────────────────────────────────────────────────────
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

  // ── Render Content Type Icon & Badge ─────────────────────────────────────
  const renderTypeIcon = (type: ContentType, size = 'w-5 h-5') => {
    switch (type) {
      case 'pdf':
        return <FileText className={`${size} text-rose-600`} />
      case 'excel':
        return <FileSpreadsheet className={`${size} text-emerald-600`} />
      case 'youtube':
        return <PlayCircle className={`${size} text-red-600`} />
      case 'ppt':
        return <Presentation className={`${size} text-amber-600`} />
      case 'url':
        return <Globe className={`${size} text-cyan-600`} />
      default:
        return <FileText className={`${size} text-gray-600`} />
    }
  }

  const renderTypeBadge = (type: ContentType) => {
    switch (type) {
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <FileText className="w-3.5 h-3.5" /> PDF Document
          </span>
        )
      case 'excel':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel Sheet
          </span>
        )
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <Play className="w-3 h-3 fill-red-600 text-red-600" /> YouTube Lecture
          </span>
        )
      case 'ppt':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Presentation className="w-3.5 h-3.5" /> PPT Slides
          </span>
        )
      case 'url':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Globe className="w-3.5 h-3.5" /> Web Link
          </span>
        )
    }
  }

  // ── Determine Current View Level ──────────────────────────────────────────
  const currentLevel = useMemo(() => {
    if (!selectedClass) return 'classes'
    if (!selectedSection) return 'sections'
    if (!selectedSubject) return 'subjects'
    if (!selectedLesson) return 'lessons'
    return 'content'
  }, [selectedClass, selectedSection, selectedSubject, selectedLesson])

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-500/10'
                : 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-500/10'
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
              className="ml-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── BREADCRUMBS & NAVIGATION BAR ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <button
              onClick={() => {
                setSelectedClass(null)
                setSelectedSection(null)
                setSelectedSubject(null)
                setSelectedLesson(null)
              }}
              className={`flex items-center gap-1.5 font-medium transition-colors ${
                currentLevel === 'classes'
                  ? 'text-[#007A78] font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Study Material</span>
            </button>

            {selectedClass && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                <button
                  onClick={() => {
                    setSelectedSection(null)
                    setSelectedSubject(null)
                    setSelectedLesson(null)
                  }}
                  className={`flex items-center gap-1 font-medium transition-colors ${
                    currentLevel === 'sections'
                      ? 'text-[#007A78] font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{selectedClass}</span>
                </button>
              </>
            )}

            {selectedSection && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                <button
                  onClick={() => {
                    setSelectedSubject(null)
                    setSelectedLesson(null)
                  }}
                  className={`flex items-center gap-1 font-medium transition-colors ${
                    currentLevel === 'subjects'
                      ? 'text-[#007A78] font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{selectedSection}</span>
                </button>
              </>
            )}

            {selectedSubject && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                <button
                  onClick={() => {
                    setSelectedLesson(null)
                  }}
                  className={`flex items-center gap-1 font-medium transition-colors ${
                    currentLevel === 'lessons'
                      ? 'text-[#007A78] font-bold bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{selectedSubject}</span>
                </button>
              </>
            )}

            {selectedLesson && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="flex items-center gap-1 font-bold text-[#007A78] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                  <Folder className="w-4 h-4 text-[#007A78]" />
                  <span>{selectedLesson}</span>
                </span>
              </>
            )}
          </div>

          {/* Back Action Button (if not on top level) */}
          {currentLevel !== 'classes' && (
            <button
              onClick={() => {
                if (currentLevel === 'content') setSelectedLesson(null)
                else if (currentLevel === 'lessons') setSelectedSubject(null)
                else if (currentLevel === 'subjects') setSelectedSection(null)
                else if (currentLevel === 'sections') setSelectedClass(null)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {currentLevel === 'content'
                  ? 'Back to Lessons'
                  : currentLevel === 'lessons'
                  ? 'Back to Subjects'
                  : currentLevel === 'subjects'
                  ? 'Back to Sections'
                  : 'Back to Classes'}
              </span>
            </button>
          )}
        </div>

        {/* ── LEVEL 1: ALL CLASSES VIEW ───────────────────────────────────────── */}
        {currentLevel === 'classes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Overview Stats */}
            <div className="bg-gradient-to-r from-[#007A78] to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none transform -skew-x-12 translate-x-12" />
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-semibold uppercase tracking-wider mb-3">
                  <BookOpen className="w-3.5 h-3.5" /> Institute Curriculum Repository
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Study Material Portal</h1>
                <p className="mt-2 text-teal-100/90 text-sm sm:text-base leading-relaxed">
                  Select a class to manage or view comprehensive study notes, video lectures, practice spreadsheets, presentations, and reference links.
                </p>
              </div>

              {/* Stats Bar */}
              <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold">{masterClasses.length}</div>
                  <div className="text-xs text-teal-100">Total Classes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{materials.length}</div>
                  <div className="text-xs text-teal-100">Study Materials</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {materials.filter(m => m.contentType === 'youtube').length}
                  </div>
                  <div className="text-xs text-teal-100">Video Lectures</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {materials.filter(m => m.contentType === 'pdf').length}
                  </div>
                  <div className="text-xs text-teal-100">PDF Documents</div>
                </div>
              </div>
            </div>

            {/* Class Search & Title */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Select Class</h2>
                <p className="text-xs text-slate-500">Choose a class to explore its sections and subjects</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search class (e.g. Class 10)..."
                  value={classSearch}
                  onChange={e => setClassSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredClasses.map(cls => {
                const count = getClassMaterialCount(cls.className)
                const sectionsList = getAvailableSectionsForClass(cls.className, masterSections, masterClasses)

                return (
                  <div
                    key={cls.className}
                    onClick={() => {
                      setSelectedClass(cls.className)
                    }}
                    className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#007A78] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#007A78] flex items-center justify-center font-bold text-lg group-hover:scale-105 group-hover:bg-[#007A78] group-hover:text-white transition-all shadow-sm">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {sectionsList.length} {sectionsList.length === 1 ? 'Section' : 'Sections'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#007A78] transition-colors">
                        {cls.className}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {sectionsList.slice(0, 3).join(', ')}
                        {sectionsList.length > 3 ? '...' : ''}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600">
                        <strong className="text-slate-900 font-semibold">{count}</strong> Materials
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#007A78] group-hover:translate-x-1 transition-transform">
                        Explore <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── LEVEL 2: SECTIONS VIEW ─────────────────────────────────────────── */}
        {currentLevel === 'sections' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-50 text-[#007A78] text-xs font-semibold mb-2">
                  <GraduationCap className="w-3.5 h-3.5" /> Selected Class
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{selectedClass}</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Click a section below to access its assigned subjects and study materials
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedClass(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Class
                </button>
              </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableSections.map(sec => {
                const count = getSectionMaterialCount(selectedClass!, sec)
                const subjectCount = availableSubjects.length

                return (
                  <div
                    key={sec}
                    onClick={() => {
                      setSelectedSection(sec)
                    }}
                    className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#007A78] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#007A78] flex items-center justify-center font-bold text-lg group-hover:scale-105 group-hover:bg-[#007A78] group-hover:text-white transition-all shadow-sm">
                          <Layers className="w-6 h-6" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#007A78] border border-teal-100">
                          {selectedClass}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#007A78] transition-colors">
                        {sec}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {subjectCount} Subjects Available
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600">
                        <strong className="text-slate-900 font-semibold">{count}</strong> Materials
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#007A78] group-hover:translate-x-1 transition-transform">
                        Select Section <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── LEVEL 3: SUBJECTS VIEW ─────────────────────────────────────────── */}
        {currentLevel === 'subjects' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-50 text-[#007A78] text-xs font-semibold mb-2">
                  <Layers className="w-3.5 h-3.5" /> {selectedClass} • {selectedSection}
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Select Subject</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Choose a subject to manage or upload PDFs, video lectures, spreadsheets, and links
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSection(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Section
                </button>
              </div>
            </div>

            {/* Subject Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-slate-800">
                Subjects for {selectedClass} ({availableSubjects.length})
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search subject (e.g. Mathematics)..."
                  value={subjectSearch}
                  onChange={e => setSubjectSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSubjects.map(sub => {
                const count = getSubjectMaterialCount(selectedClass!, selectedSection!, sub)
                const subMaterials = materials.filter(
                  m =>
                    checkClassMatch(m.className, selectedClass!) &&
                    m.section.toLowerCase() === selectedSection!.toLowerCase() &&
                    m.subject.toLowerCase() === sub.toLowerCase()
                )
                const pdfCount = subMaterials.filter(m => m.contentType === 'pdf').length
                const videoCount = subMaterials.filter(m => m.contentType === 'youtube').length

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
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#007A78] flex items-center justify-center font-bold text-lg group-hover:scale-105 group-hover:bg-[#007A78] group-hover:text-white transition-all shadow-sm">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {count} {count === 1 ? 'Resource' : 'Resources'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#007A78] transition-colors">
                        {sub}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {pdfCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                            <FileText className="w-3 h-3" /> {pdfCount} PDF
                          </span>
                        )}
                        {videoCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            <Play className="w-2.5 h-2.5 fill-red-600" /> {videoCount} Video
                          </span>
                        )}
                        {count === 0 && (
                          <span className="text-[11px] text-slate-400">No resources yet</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-[#007A78]">Manage Materials</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#007A78] group-hover:translate-x-1 transition-transform">
                        Open <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── LEVEL 4: LESSON / CHAPTER FOLDERS VIEW ────────────────────────── */}
        {currentLevel === 'lessons' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-50 text-[#007A78] text-xs font-semibold mb-2">
                  <Layers className="w-3.5 h-3.5" /> {selectedClass} • {selectedSection} • {selectedSubject}
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {selectedSubject} Chapters & Folders
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Create chapter folders to organize your study materials, then click inside to upload content.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => openCreateLessonModal()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#007A78] hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>+ Create Chapter Folder</span>
                </button>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="px-3.5 py-2.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Subject
                </button>
              </div>
            </div>

            {/* Lesson Search & Folder Count */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">
                  Chapter Folders ({filteredLessons.length})
                </h2>
                <span className="text-xs font-medium text-slate-400">
                  • {allSubjectMaterials.length} total resources in {selectedSubject}
                </span>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search chapter folder..."
                  value={lessonSearch}
                  onChange={e => setLessonSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Lesson Folders Grid */}
            {filteredLessons.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#007A78] flex items-center justify-center mb-4 shadow-sm">
                  <FolderPlus className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  No Chapter Folders Yet
                </h3>
                <p className="text-xs text-slate-500 mb-5 max-w-sm">
                  Create your first chapter folder to organize and upload study materials inside.
                </p>
                <button
                  onClick={() => openCreateLessonModal()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#007A78] hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Chapter Folder</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredLessons.map(lesson => {
                  const lessonMaterials = getMaterialsForLesson(lesson.lessonName)
                  const count = lessonMaterials.length
                  const pdfCount = lessonMaterials.filter(m => m.contentType === 'pdf').length
                  const videoCount = lessonMaterials.filter(m => m.contentType === 'youtube').length
                  const otherCount = count - pdfCount - videoCount

                  const colorMap: Record<string, { iconBg: string; borderHover: string; text: string }> = {
                    blue: { iconBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white', borderHover: 'hover:border-blue-500', text: 'text-blue-600' },
                    indigo: { iconBg: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white', borderHover: 'hover:border-indigo-500', text: 'text-indigo-600' },
                    violet: { iconBg: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white', borderHover: 'hover:border-violet-500', text: 'text-violet-600' },
                    emerald: { iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white', borderHover: 'hover:border-emerald-500', text: 'text-emerald-600' },
                    amber: { iconBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white', borderHover: 'hover:border-amber-500', text: 'text-amber-600' },
                    rose: { iconBg: 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white', borderHover: 'hover:border-rose-500', text: 'text-rose-600' },
                    teal: { iconBg: 'bg-teal-50 text-[#007A78] group-hover:bg-[#007A78] group-hover:text-white', borderHover: 'hover:border-[#007A78]', text: 'text-[#007A78]' }
                  }
                  const theme = colorMap[lesson.color || 'teal'] || colorMap.teal

                  return (
                    <div
                      key={lesson.id || lesson.lessonName}
                      className={`group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md ${theme.borderHover} transition-all flex flex-col justify-between`}
                    >
                      <div>
                        {/* Folder Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div
                            onClick={() => setSelectedLesson(lesson.lessonName)}
                            className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center transition-all shadow-sm cursor-pointer`}
                          >
                            <Folder className="w-6 h-6" />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                              {count} {count === 1 ? 'Resource' : 'Resources'}
                            </span>
                            {!lesson.id.startsWith('auto_') && (
                              <>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation()
                                    openEditLessonModal(lesson)
                                  }}
                                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                  title="Edit Folder"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation()
                                    setDeleteLessonId(lesson.id)
                                  }}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Delete Folder"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <div
                          onClick={() => setSelectedLesson(lesson.lessonName)}
                          className="cursor-pointer"
                        >
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#007A78] transition-colors line-clamp-2">
                            {lesson.lessonName}
                          </h3>
                        </div>

                        {/* Breakdown Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {pdfCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                              <FileText className="w-3 h-3" /> {pdfCount} PDF
                            </span>
                          )}
                          {videoCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                              <Play className="w-2.5 h-2.5 fill-red-600" /> {videoCount} Video
                            </span>
                          )}
                          {otherCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              +{otherCount} Other
                            </span>
                          )}
                          {count === 0 && (
                            <span className="text-[10.5px] text-slate-400">Empty folder</span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div
                        onClick={() => setSelectedLesson(lesson.lessonName)}
                        className={`mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold ${theme.text} cursor-pointer`}
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
            )}
          </div>
        )}

        {/* ── LEVEL 5: STUDY MATERIAL CONTENT MANAGER (INSIDE LESSON FOLDER) ── */}
        {currentLevel === 'content' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header with Quick Subject Switcher & Add Button */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-100 text-teal-800">
                      {selectedClass}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                      {selectedSection}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#007A78] text-white">
                      {selectedSubject}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md mb-1 w-fit border border-teal-200/60">
                    <Folder className="w-3.5 h-3.5 text-[#007A78]" />
                    <span>Folder: {selectedLesson}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {selectedLesson} — Study Materials
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Upload and manage notes, PDFs, YouTube video lectures, spreadsheets, and links inside this lesson folder.
                  </p>
                </div>

                {/* Primary Add Button & Actions */}
                <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
                  <button
                    onClick={() => openAddModal()}
                    className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#007A78] hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Upload to this Lesson</span>
                  </button>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="px-3.5 py-2.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Lessons
                  </button>
                </div>
              </div>

              {/* Quick Subject Tabs to switch subjects instantly */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Other Subjects:</span>
                {availableSubjects.map(sub => (
                  <button
                    key={sub}
                    onClick={() => {
                      setSelectedSubject(sub)
                      setSelectedLesson(null)
                    }}
                    className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition ${
                      sub === selectedSubject
                        ? 'bg-[#007A78] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Filters & Search */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Content', icon: Folder },
                  { id: 'pdf', label: 'PDFs', icon: FileText, color: 'text-rose-600' },
                  { id: 'youtube', label: 'YouTube Lectures', icon: PlayCircle, color: 'text-red-600' },
                  { id: 'excel', label: 'Excel Sheets', icon: FileSpreadsheet, color: 'text-emerald-600' },
                  { id: 'ppt', label: 'PPT Slides', icon: Presentation, color: 'text-amber-600' },
                  { id: 'url', label: 'Web Links', icon: Globe, color: 'text-cyan-600' },
                ].map(tab => {
                  const Icon = tab.icon
                  const active = selectedTypeFilter === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTypeFilter(tab.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                        active
                          ? 'bg-[#007A78] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : tab.color || ''}`} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search materials, topics..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Materials List / Grid */}
            {currentSubjectMaterials.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#007A78] flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Study Materials Found</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6">
                  {searchQuery || selectedTypeFilter !== 'all'
                    ? 'No items match your active search or content filter.'
                    : `No study resources have been added to ${selectedClass} • ${selectedSection} • ${selectedSubject} yet.`}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => openAddModal('pdf')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
                  >
                    <FileText className="w-4 h-4" /> + Add PDF
                  </button>
                  <button
                    onClick={() => openAddModal('youtube')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition"
                  >
                    <PlayCircle className="w-4 h-4" /> + Add YouTube Video
                  </button>
                  <button
                    onClick={() => openAddModal('excel')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> + Add Excel Sheet
                  </button>
                  <button
                    onClick={() => openAddModal('ppt')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
                  >
                    <Presentation className="w-4 h-4" /> + Add PPT Slides
                  </button>
                  <button
                    onClick={() => openAddModal('url')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition"
                  >
                    <Globe className="w-4 h-4" /> + Add Any URL
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentSubjectMaterials.map(item => {
                  const isYouTube = item.contentType === 'youtube'
                  const embedUrl = isYouTube ? getYouTubeEmbedUrl(item.url) : null

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top Header Card Info */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          {renderTypeBadge(item.contentType)}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(item)}
                              title="Edit Material"
                              className="p-1.5 text-slate-400 hover:text-[#007A78] hover:bg-slate-100 rounded-lg transition"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingId(item.id)
                                setDeleteModalOpen(true)
                              }}
                              title="Delete Material"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Chapter / Topic */}
                        {item.chapterTopic && (
                          <div className="text-xs font-semibold text-[#007A78] uppercase tracking-wide mb-1">
                            {item.chapterTopic}
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {/* File Details / Metadata */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="truncate max-w-[160px] font-medium text-slate-600">
                            {item.fileName || item.contentType.toUpperCase()}
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-600">
                            {item.fileSize || 'Standard'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {isYouTube ? (
                          <button
                            onClick={() => {
                              setYoutubePlayerModal({ open: true, item })
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" /> Watch Video Lecture
                          </button>
                        ) : (
                          <>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-[#007A78] hover:bg-teal-700 text-white rounded-xl transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>
                                {item.contentType === 'pdf'
                                  ? 'View PDF'
                                  : item.contentType === 'excel'
                                  ? 'Open Sheet'
                                  : item.contentType === 'ppt'
                                  ? 'View Slides'
                                  : 'Visit Link'}
                              </span>
                            </a>

                            {item.allowDownload && (
                              <a
                                href={item.url}
                                download={item.fileName || true}
                                target="_blank"
                                rel="noreferrer"
                                title="Download File"
                                className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-200 border border-slate-200 rounded-xl transition"
                              >
                                <Download className="w-4 h-4" />
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

      {/* ── MODAL 1: ADD / EDIT STUDY MATERIAL ─────────────────────────────── */}
      {addEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-7 relative">
            <button
              onClick={() => setAddEditModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-50 text-[#007A78] text-xs font-semibold mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {selectedClass} • {selectedSection} • {selectedSubject}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {editingItem ? 'Edit Study Material' : 'Add Study Material'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Attach curriculum documents, YouTube video lectures, spreadsheets, or web resources.
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMaterial} className="space-y-5">
              {/* Content Type Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Content Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { type: 'pdf' as ContentType, label: 'PDF Document', icon: FileText, color: 'text-rose-600', activeBg: 'bg-rose-50 border-rose-400 text-rose-800' },
                    { type: 'excel' as ContentType, label: 'Excel Sheet', icon: FileSpreadsheet, color: 'text-emerald-600', activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-800' },
                    { type: 'youtube' as ContentType, label: 'YouTube Video', icon: PlayCircle, color: 'text-red-600', activeBg: 'bg-red-50 border-red-400 text-red-800' },
                    { type: 'ppt' as ContentType, label: 'PPT Slides', icon: Presentation, color: 'text-amber-600', activeBg: 'bg-amber-50 border-amber-400 text-amber-800' },
                    { type: 'url' as ContentType, label: 'Web URL', icon: Globe, color: 'text-cyan-600', activeBg: 'bg-cyan-50 border-cyan-400 text-cyan-800' },
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
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? `${tab.activeBg} font-bold ring-2 ring-offset-1 ring-[#007A78]`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${tab.color}`} />
                        <span className="text-xs leading-tight">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 1. Material Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:bg-white transition"
                />
              </div>

              {/* 2. File Link & Choose File Option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {formType === 'youtube'
                    ? 'YouTube Video Link *'
                    : formType === 'url'
                    ? 'Website or Resource Link *'
                    : 'File Link *'}
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
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:bg-white transition"
                    />
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Choose Option (Choose File from Device) */}
                  {formType !== 'youtube' && formType !== 'url' && (
                    <label className="shrink-0 cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl font-medium text-xs sm:text-sm text-slate-700 transition flex items-center justify-center gap-1.5 active:scale-95 shadow-sm">
                      <Upload className="w-4 h-4 text-[#007A78]" />
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
                  <div className="text-[11px] text-teal-700 font-medium mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Selected: {formFileName} {formFileSize ? `(${formFileSize})` : ''}</span>
                  </div>
                )}
                {formType === 'youtube' && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Paste any standard YouTube link to embed it for students.
                  </p>
                )}
              </div>

              {/* 3. Description Only */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter brief description or instructions for students..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:bg-white transition resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 text-sm font-semibold bg-[#007A78] hover:bg-teal-700 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> {editingItem ? 'Save Changes' : 'Upload Material'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
            {/* Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-red-500 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold truncate max-w-md">
                    {youtubePlayerModal.item.title}
                  </h3>
                  <div className="text-xs text-slate-400">
                    {youtubePlayerModal.item.chapterTopic || 'Video Lecture'} • {youtubePlayerModal.item.subject}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setYoutubePlayerModal({ open: false, item: null })}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Iframe */}
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
                  <p className="text-sm font-medium">Unable to parse YouTube video URL.</p>
                  <a
                    href={youtubePlayerModal.item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Open on YouTube Directly
                  </a>
                </div>
              )}
            </div>

            {/* Video Footer info */}
            <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
              <p className="line-clamp-2 max-w-xl text-slate-400">
                {youtubePlayerModal.item.description || 'Interactive institute video lecture.'}
              </p>
              <a
                href={youtubePlayerModal.item.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition"
              >
                Open in YouTube <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DELETE CONFIRMATION ──────────────────────────────────── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Study Material</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6">
              Are you sure you want to permanently remove this study material? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false)
                  setDeletingId(null)
                }}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: CREATE / EDIT LESSON FOLDER ────────────────────────── */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-teal-50 to-white border-b border-teal-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#007A78] text-white flex items-center justify-center shadow-md">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {editingLesson ? 'Edit Chapter Folder' : 'Create Chapter Folder'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedClass} • {selectedSection} • {selectedSubject}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLessonModalOpen(false)
                  setEditingLesson(null)
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveLessonFolder} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Chapter Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: Introduction or Chemical Reactions"
                  value={lessonFormName}
                  onChange={e => setLessonFormName(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:bg-white transition"
                  autoFocus
                />
              </div>

              {/* Color Scheme Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Folder Color
                </label>
                <div className="flex items-center gap-2.5 pt-1">
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
                      className={`w-9 h-9 rounded-full ${c.bg} transition-all flex items-center justify-center cursor-pointer ${
                        lessonFormColor === c.id ? 'ring-2 ring-offset-2 ring-[#007A78] scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {lessonFormColor === c.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setLessonModalOpen(false)
                    setEditingLesson(null)
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLesson}
                  className="px-6 py-2.5 text-sm font-semibold bg-[#007A78] hover:bg-teal-700 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submittingLesson ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> {editingLesson ? 'Update Chapter' : 'Create Chapter'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Lesson Folder</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6">
              Are you sure you want to delete this folder? Any study materials inside will remain in the subject catalog.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteLessonId(null)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLessonConfirm}
                className="px-5 py-2.5 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


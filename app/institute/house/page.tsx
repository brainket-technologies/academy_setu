'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, Plus, MoreVertical, X, CheckCircle2,
  Users, Eye, Pencil, Trash2, Check,
  Palette, User, GraduationCap, Award, LayoutGrid, List
} from 'lucide-react'
import Link from 'next/link'
import { fetchTeachers } from '@/app/institute/teachers/actions'
import { fetchStudents } from '@/app/institute/students/actions'
import { useClasses, useSections } from '@/lib/mastersData'

interface HouseRecord {
  id: number
  name: string
  members: number
  captain: string
  captainClass?: string
  captainSection?: string
  vCaptain: string
  vCaptainClass?: string
  vCaptainSection?: string
  teacher: string
  tagline?: string
  objective?: string
  colorCode?: string
}

const PRESET_COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Pink', hex: '#EC4899' },
]

const INITIAL_HOUSES: HouseRecord[] = []

export default function HouseBlocksPage() {
  const classesData = useClasses()
  const sectionsData = useSections()

  const [houses, setHouses] = useState<HouseRecord[]>(INITIAL_HOUSES)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)

  // Teachers & Students Data
  const [teachersList, setTeachersList] = useState<any[]>([])
  const [allStudents, setAllStudents] = useState<any[]>([])

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingHouseId, setEditingHouseId] = useState<number | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState<HouseRecord | null>(null)

  // Create/Edit Form State
  const [houseName, setHouseName] = useState('Red House')
  const [customColor, setCustomColor] = useState('#EF4444')
  const [tagline, setTagline] = useState('')
  const [teacher, setTeacher] = useState('')
  const [captain, setCaptain] = useState('')
  const [captainClass, setCaptainClass] = useState('')
  const [captainSection, setCaptainSection] = useState('')
  const [vCaptain, setVCaptain] = useState('')
  const [vCaptainClass, setVCaptainClass] = useState('')
  const [vCaptainSection, setVCaptainSection] = useState('')
  const [objective, setObjective] = useState('')

  // Assign members modal state
  const [assignClass, setAssignClass] = useState('')
  const [assignSection, setAssignSection] = useState('')
  const [assignMemberCount, setAssignMemberCount] = useState(5)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load houses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('school_houses')
    if (saved) {
      try {
        setHouses(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_houses', JSON.stringify(INITIAL_HOUSES))
    }
  }, [])

  // Load teachers from DB & localStorage
  useEffect(() => {
    async function loadTeachers() {
      const parseLocal = (key: string) => {
        try {
          const raw = localStorage.getItem(key)
          return raw ? JSON.parse(raw) : []
        } catch {
          return []
        }
      }
      const local = parseLocal('school_teachers')
      try {
        const res = await fetchTeachers()
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const dbNames = new Set(res.data.map((t: any) => String(t.name).trim().toLowerCase()))
          const unqLocal = local.filter((t: any) => !dbNames.has(String(t.name || t.teacherName).trim().toLowerCase()))
          setTeachersList([...res.data, ...unqLocal])
        } else if (local.length > 0) {
          setTeachersList(local)
        }
      } catch {
        if (local.length > 0) setTeachersList(local)
      }
    }
    loadTeachers()
  }, [])

  // Load students from DB & localStorage
  useEffect(() => {
    async function loadStudents() {
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
        const res = await fetchStudents()
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const dbIds = new Set(res.data.map((s: any) => String(s.id || s.admission_no || s.admissionNo)))
          const unqLocal = localStudents.filter((s: any) => !dbIds.has(String(s.id || s.admission_no || s.admissionNo)))
          setAllStudents([...res.data, ...unqLocal])
        } else if (localStudents.length > 0) {
          setAllStudents(localStudents)
        }
      } catch {
        if (localStudents.length > 0) setAllStudents(localStudents)
      }
    }
    loadStudents()
  }, [])

  // Dynamic Class options
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
    return Array.from(set)
  }, [classesData, allStudents])

  // Helper for sections of a given class
  const getSectionsForClass = (cls: string) => {
    if (!cls) return []
    const set = new Set<string>()
    const targetNorm = cls.trim().toLowerCase()

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
    allStudents.forEach(s => {
      const sc = String(s.class_name || s.className || s.class || '').trim().toLowerCase()
      if (sc === targetNorm) {
        const name = s.section_name || s.sectionName || s.section
        if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
      }
    })
    if (set.size === 0) return ['A', 'B', 'C']
    return Array.from(set)
  }

  // Filtered students for House Captain
  const filteredStudentsForCaptain = useMemo(() => {
    return allStudents.filter(s => {
      const sc = String(s.class_name || s.className || s.class || '').trim().toLowerCase()
      const ss = String(s.section_name || s.sectionName || s.section || '').trim().toLowerCase()
      const cMatch = !captainClass || sc === captainClass.trim().toLowerCase()
      const normSection = captainSection.toLowerCase().replace(/^(section|sec)\s*/i, '').trim()
      const normStudentSection = ss.replace(/^(section|sec)\s*/i, '').trim()
      const sMatch = !captainSection || ss === captainSection.toLowerCase() || (normSection && normStudentSection === normSection)
      return cMatch && sMatch
    })
  }, [allStudents, captainClass, captainSection])

  // Filtered students for House Vice Captain
  const filteredStudentsForVCaptain = useMemo(() => {
    return allStudents.filter(s => {
      const sc = String(s.class_name || s.className || s.class || '').trim().toLowerCase()
      const ss = String(s.section_name || s.sectionName || s.section || '').trim().toLowerCase()
      const cMatch = !vCaptainClass || sc === vCaptainClass.trim().toLowerCase()
      const normSection = vCaptainSection.toLowerCase().replace(/^(section|sec)\s*/i, '').trim()
      const normStudentSection = ss.replace(/^(section|sec)\s*/i, '').trim()
      const sMatch = !vCaptainSection || ss === vCaptainSection.toLowerCase() || (normSection && normStudentSection === normSection)
      return cMatch && sMatch
    })
  }, [allStudents, vCaptainClass, vCaptainSection])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const resetForm = () => {
    setEditingHouseId(null)
    setHouseName('Red House')
    setCustomColor('#EF4444')
    setTagline('')
    setTeacher('')
    setCaptain('')
    setCaptainClass('')
    setCaptainSection('')
    setVCaptain('')
    setVCaptainClass('')
    setVCaptainSection('')
    setObjective('')
  }

  const handleOpenCreate = () => {
    resetForm()
    setCreateModalOpen(true)
  }

  const handleOpenEdit = (h: HouseRecord) => {
    setEditingHouseId(h.id)
    setHouseName(h.name)
    setCustomColor(h.colorCode || '#EF4444')
    setTeacher(h.teacher || '')
    setCaptain(h.captain || '')
    setCaptainClass(h.captainClass || '')
    setCaptainSection(h.captainSection || '')
    setVCaptain(h.vCaptain || '')
    setVCaptainClass(h.vCaptainClass || '')
    setVCaptainSection(h.vCaptainSection || '')
    setTagline(h.tagline || '')
    setObjective(h.objective || '')
    setActiveMenuId(null)
    setCreateModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this house record?')) {
      const updated = houses.filter(h => h.id !== id)
      setHouses(updated)
      localStorage.setItem('school_houses', JSON.stringify(updated))
      setActiveMenuId(null)
      showToast('House record deleted successfully!')
    }
  }

  const handleCreateOrUpdateHouse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!houseName.trim()) {
      alert('Please enter a House Name.')
      return
    }
    if (!teacher.trim()) {
      alert('Please select or enter a House Teacher.')
      return
    }
    if (!captain.trim()) {
      alert('Please select or enter a House Captain.')
      return
    }

    const finalColor = customColor || '#EF4444'

    if (editingHouseId) {
      const updated = houses.map(h => {
        if (h.id === editingHouseId) {
          return {
            ...h,
            name: houseName.trim(),
            colorCode: finalColor,
            teacher: teacher.trim(),
            captain: captain.trim(),
            captainClass,
            captainSection,
            vCaptain: vCaptain.trim() || captain.trim(),
            vCaptainClass,
            vCaptainSection,
            tagline: tagline.trim(),
            objective: objective.trim()
          }
        }
        return h
      })
      setHouses(updated)
      localStorage.setItem('school_houses', JSON.stringify(updated))
      showToast('House record updated successfully!')
    } else {
      const newHouse: HouseRecord = {
        id: Date.now(),
        name: houseName.trim(),
        members: 0,
        captain: captain.trim(),
        captainClass,
        captainSection,
        vCaptain: vCaptain.trim() || captain.trim(),
        vCaptainClass,
        vCaptainSection,
        teacher: teacher.trim(),
        tagline: tagline.trim(),
        objective: objective.trim(),
        colorCode: finalColor
      }
      const updated = [newHouse, ...houses]
      setHouses(updated)
      localStorage.setItem('school_houses', JSON.stringify(updated))
      showToast('House created successfully!')
    }

    resetForm()
    setCreateModalOpen(false)
  }

  const handleAssignMembers = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHouse) return

    const updated = houses.map(h => {
      if (h.id === selectedHouse.id) {
        return { ...h, members: h.members + assignMemberCount }
      }
      return h
    })
    setHouses(updated)
    localStorage.setItem('school_houses', JSON.stringify(updated))
    setAssignModalOpen(false)
    showToast(`Assigned ${assignMemberCount} members to ${selectedHouse.name}!`)
  }

  const handleOpenAssign = (house: HouseRecord) => {
    setSelectedHouse(house)
    setActiveMenuId(null)
    setAssignClass('')
    setAssignSection('')
    setAssignModalOpen(true)
  }

  const handleOpenViewDetails = (house: HouseRecord) => {
    setSelectedHouse(house)
    setActiveMenuId(null)
    setDetailsModalOpen(true)
  }

  const filtered = useMemo(() => {
    return houses.filter(h => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchName = h.name.toLowerCase().includes(q)
        const matchCaptain = h.captain.toLowerCase().includes(q)
        const matchTeacher = h.teacher.toLowerCase().includes(q)
        const matchVCaptain = h.vCaptain?.toLowerCase().includes(q)
        if (!matchName && !matchCaptain && !matchTeacher && !matchVCaptain) return false
      }
      return true
    })
  }, [houses, searchQuery])

  return (
    <div className="flex flex-col gap-5 w-full pb-10 animate-in fade-in duration-300">
      
      {/* ── TOP HEADER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-slate-800 dark:text-white">House/Block</h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-black border border-amber-200 dark:border-amber-900/50">
            Total House/Block <span className="bg-amber-200/70 dark:bg-amber-800/60 px-1.5 py-0.2 rounded text-[11px]">{houses.length}</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search bar */}
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search house, captain, teacher..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold bg-white dark:bg-slate-900"
            />
          </div>

          {/* View Toggle (Cards vs Table) */}
          <div className="flex items-center p-0.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add House Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add House</span>
          </button>
        </div>
      </div>

      {/* ── CARD TYPE GRID (PRIMARY VIEW) ── */}
      {viewMode === 'card' && (
        <>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filtered.map(item => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group relative"
                >
                  {/* Top Color Accent Ribbon */}
                  <div
                    className="h-2.5 w-full"
                    style={{ backgroundColor: item.colorCode || '#EF4444' }}
                  />

                  <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3.5">
                    {/* Card Header: Badge & Member Count */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-black text-white shadow-2xs inline-flex items-center gap-1.5 max-w-full"
                          style={{ backgroundColor: item.colorCode || '#EF4444' }}
                        >
                          <span className="w-2 h-2 rounded-full bg-white/80 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </span>
                        {item.tagline && (
                          <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1">
                            "{item.tagline}"
                          </p>
                        )}
                      </div>

                      {/* Members pill */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shrink-0">
                        <Users className="w-3.5 h-3.5 text-teal-600" />
                        <span>{item.members}</span>
                      </span>
                    </div>

                    {/* Leadership Info */}
                    <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                      {/* Teacher */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> Teacher:
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 truncate text-right">
                          {item.teacher || '—'}
                        </span>
                      </div>

                      {/* Captain */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
                          <span className="text-sm">👑</span> Captain:
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 truncate text-right">
                          {item.captain || '—'}
                        </span>
                      </div>

                      {/* Vice Captain */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
                          <span className="text-sm">⭐</span> V. Captain:
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate text-right">
                          {item.vCaptain || '—'}
                        </span>
                      </div>

                      {item.objective && (
                        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/40">
                          <p className="text-[10px] text-slate-400 font-medium line-clamp-2">
                            <strong className="text-slate-500">Objective:</strong> {item.objective}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 mt-auto border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenAssign(item)}
                        className="flex-1 py-1.5 px-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenViewDetails(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                        title="View Info"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-emerald-600 rounded-lg transition-colors"
                        title="Edit House"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 rounded-lg transition-colors"
                        title="Delete House"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center shadow-sm space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
                🏛️
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white">No Houses/Blocks Created Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create houses with custom names and colors, assign house teachers, and select student captains and vice captains.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create First House</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ── TABLE VIEW (OPTIONAL ALTERNATIVE) ── */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700">
            <table className="w-full text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/60 font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-xs">
                <tr>
                  <th className="px-3 py-3.5 w-14">S. No.</th>
                  <th className="px-4 py-3.5 text-left">House Name</th>
                  <th className="px-3 py-3.5 w-24">Member</th>
                  <th className="px-4 py-3.5 text-left">House Captain</th>
                  <th className="px-4 py-3.5 text-left">House V. Captain</th>
                  <th className="px-4 py-3.5 text-left">House Teacher</th>
                  <th className="px-3 py-3.5 w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/60 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors font-semibold relative">
                    <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                    <td className="px-4 py-3.5 text-left">
                      <span
                        className="px-3 py-1 rounded-full text-[11px] font-black text-white shadow-2xs inline-flex items-center gap-1.5"
                        style={{ backgroundColor: item.colorCode || '#EF4444' }}
                      >
                        <span className="w-2 h-2 rounded-full bg-white/80" />
                        {item.name}
                      </span>
                      {item.tagline && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5 ml-1 truncate max-w-xs">{item.tagline}</p>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {item.members}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                        <span className="text-sm">👑</span>
                        <span>{item.captain || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="text-sm">⭐</span>
                        <span>{item.vCaptain || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="text-sm">🎓</span>
                        <span>{item.teacher || '—'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center mx-auto transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                      </button>
                      {activeMenuId === item.id && (
                        <div className="absolute right-4 top-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1.5 w-32 animate-in fade-in zoom-in-95 duration-150 text-left">
                          <button
                            type="button"
                            onClick={() => handleOpenAssign(item)}
                            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-bold text-slate-600 dark:text-slate-200"
                          >
                            <Users className="w-3.5 h-3.5 text-teal-600" /> Assign
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenViewDetails(item)}
                            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-bold text-slate-600 dark:text-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-bold text-slate-600 dark:text-slate-200"
                          >
                            <Pencil className="w-3.5 h-3.5 text-emerald-500" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                      No houses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          CREATE / EDIT HOUSE MODAL
      ════════════════════════════════════════════════════════════════ */}
      {createModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200 max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: customColor }} />
                <h3 className="text-base font-black text-slate-850 dark:text-white">
                  {editingHouseId ? 'Edit House/Block' : 'Create House/Block'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateOrUpdateHouse} className="space-y-4 overflow-y-auto pr-1">
              
              {/* Row 1: House Name & Color Chooser */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* House Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    House/Block Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Red House, Tagore House"
                    value={houseName}
                    onChange={e => setHouseName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-xs bg-white dark:bg-slate-900 focus:border-teal-500 transition-colors"
                    required
                  />
                </div>

                {/* Choose Color */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Choose Color <span className="text-red-500">*</span>
                    </label>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-white shadow-2xs"
                      style={{ backgroundColor: customColor }}
                    >
                      {houseName || 'Preview'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {PRESET_COLORS.map(c => {
                      const isSelected = customColor.toLowerCase() === c.hex.toLowerCase()
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setCustomColor(c.hex)}
                          title={c.name}
                          className={`w-6 h-6 rounded-full border transition-all shrink-0 ${
                            isSelected ? 'ring-2 ring-slate-850 dark:ring-white scale-110 shadow-xs' : 'border-white hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      )
                    })}
                    {/* Native Picker button */}
                    <label className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-300 cursor-pointer flex items-center justify-center shrink-0 bg-gradient-to-tr from-rose-500 via-amber-400 to-blue-500 shadow-2xs hover:scale-105 transition-transform" title="Custom color picker">
                      <input
                        type="color"
                        value={customColor}
                        onChange={e => setCustomColor(e.target.value)}
                        className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 2: House Teacher (From Institute Teachers) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span>House Teacher <span className="text-red-500">*</span></span>
                  </label>
                  <span className="text-[11px] text-teal-600 font-semibold">
                    {teachersList.length} institute teacher{teachersList.length !== 1 ? 's' : ''} available
                  </span>
                </div>
                {teachersList.length > 0 ? (
                  <select
                    value={teacher}
                    onChange={e => setTeacher(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-xs bg-white dark:bg-slate-900 focus:border-teal-500 transition-colors"
                    required
                  >
                    <option value="">Select House Teacher from Institute</option>
                    {teachersList.map((t: any, idx: number) => {
                      const tName = t.name || t.teacherName || t.fullName || 'Teacher'
                      const tContact = t.contact || t.phone || t.email || ''
                      return (
                        <option key={t.id || idx} value={tName}>
                          {tName} {tContact ? `(${tContact})` : ''}
                        </option>
                      )
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter House Teacher Name"
                    value={teacher}
                    onChange={e => setTeacher(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-xs bg-white dark:bg-slate-900 focus:border-teal-500 transition-colors"
                    required
                  />
                )}
              </div>

              {/* Row 3: House Captain & Vice Captain (Side-by-Side Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* House Captain */}
                <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="text-sm">👑</span>
                      <span>House Captain <span className="text-red-500">*</span></span>
                    </label>
                    {captain && (
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 truncate max-w-[140px]" title={captain}>
                        {captain}
                      </span>
                    )}
                  </div>
                  {/* Class & Section mini filters */}
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={captainClass}
                      onChange={e => {
                        setCaptainClass(e.target.value)
                        setCaptainSection('')
                      }}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none text-[11px] font-semibold"
                    >
                      <option value="">All Classes</option>
                      {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                      value={captainSection}
                      onChange={e => setCaptainSection(e.target.value)}
                      disabled={!captainClass}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none text-[11px] font-semibold disabled:opacity-50"
                    >
                      <option value="">All Sections</option>
                      {getSectionsForClass(captainClass).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Student selector */}
                  {filteredStudentsForCaptain.length > 0 ? (
                    <select
                      value={captain}
                      onChange={e => setCaptain(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none text-xs font-bold"
                      required
                    >
                      <option value="">Select Captain ({filteredStudentsForCaptain.length} students)</option>
                      {filteredStudentsForCaptain.map(s => {
                        const sName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || 'Unknown'
                        const roll = s.roll_no || s.rollNo || ''
                        return (
                          <option key={s.id} value={sName}>
                            {sName} {roll ? `(Roll: ${roll})` : ''}
                          </option>
                        )
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter Captain Name"
                      value={captain}
                      onChange={e => setCaptain(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none text-xs font-bold"
                      required
                    />
                  )}
                </div>

                {/* House Vice Captain */}
                <div className="p-3.5 bg-teal-50/60 dark:bg-teal-950/25 border border-teal-100 dark:border-teal-900/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="text-sm">⭐</span>
                      <span>House Vice Captain</span>
                    </label>
                    {vCaptain && (
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 truncate max-w-[140px]" title={vCaptain}>
                        {vCaptain}
                      </span>
                    )}
                  </div>
                  {/* Class & Section mini filters */}
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={vCaptainClass}
                      onChange={e => {
                        setVCaptainClass(e.target.value)
                        setVCaptainSection('')
                      }}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none text-[11px] font-semibold"
                    >
                      <option value="">All Classes</option>
                      {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                      value={vCaptainSection}
                      onChange={e => setVCaptainSection(e.target.value)}
                      disabled={!vCaptainClass}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none text-[11px] font-semibold disabled:opacity-50"
                    >
                      <option value="">All Sections</option>
                      {getSectionsForClass(vCaptainClass).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Student selector */}
                  {filteredStudentsForVCaptain.length > 0 ? (
                    <select
                      value={vCaptain}
                      onChange={e => setVCaptain(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none text-xs font-bold"
                    >
                      <option value="">Select Vice Captain ({filteredStudentsForVCaptain.length} students)</option>
                      {filteredStudentsForVCaptain.map(s => {
                        const sName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || 'Unknown'
                        const roll = s.roll_no || s.rollNo || ''
                        return (
                          <option key={s.id} value={sName}>
                            {sName} {roll ? `(Roll: ${roll})` : ''}
                          </option>
                        )
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter V. Captain Name"
                      value={vCaptain}
                      onChange={e => setVCaptain(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none text-xs font-bold"
                    />
                  )}
                </div>
              </div>

              {/* Row 4: Tagline & Objective */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Tagline / Motto</label>
                  <input
                    type="text"
                    placeholder="e.g. Courage, Honor & Excellence"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-xs bg-white dark:bg-slate-900 focus:border-teal-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Objective</label>
                  <input
                    type="text"
                    placeholder="e.g. Academic and Athletic Leadership"
                    value={objective}
                    onChange={e => setObjective(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-xs bg-white dark:bg-slate-900 focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm text-xs transition-colors"
                >
                  {editingHouseId ? 'Save Changes' : 'Create House'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          ASSIGN MEMBERS MODAL
      ════════════════════════════════════════════════════════════════ */}
      {assignModalOpen && selectedHouse && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={() => setAssignModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-3.5 animate-in zoom-in-95 duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedHouse.colorCode || '#EF4444' }} />
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Assign to {selectedHouse.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleAssignMembers} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">House/Block</label>
                  <input
                    type="text"
                    value={selectedHouse.name}
                    readOnly
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">Current Members</label>
                  <input
                    type="text"
                    value={selectedHouse.members}
                    readOnly
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">Class</label>
                  <select
                    value={assignClass}
                    onChange={e => {
                      setAssignClass(e.target.value)
                      setAssignSection('')
                    }}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none font-bold text-xs"
                  >
                    <option value="">Select Class</option>
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">Section</label>
                  <select
                    value={assignSection}
                    onChange={e => setAssignSection(e.target.value)}
                    disabled={!assignClass}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none font-bold text-xs disabled:opacity-50"
                  >
                    <option value="">Select Section</option>
                    {getSectionsForClass(assignClass).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500">Number of Members to Allocate</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={assignMemberCount}
                  onChange={e => setAssignMemberCount(parseInt(e.target.value) || 1)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-xs bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-sm text-xs"
                >
                  Allocate Members
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          DETAILS MODAL
      ════════════════════════════════════════════════════════════════ */}
      {detailsModalOpen && selectedHouse && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={() => setDetailsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-3.5 animate-in zoom-in-95 duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedHouse.colorCode || '#EF4444' }} />
                <h3 className="text-sm font-black text-slate-800 dark:text-white">{selectedHouse.name} House Info</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">House Captain</span>
                <p className="font-bold text-slate-800 dark:text-white text-xs mt-0.5">👑 {selectedHouse.captain}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Vice Captain</span>
                <p className="font-bold text-slate-800 dark:text-white text-xs mt-0.5">⭐ {selectedHouse.vCaptain}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">House Teacher</span>
                <p className="font-bold text-slate-800 dark:text-white text-xs mt-0.5">🎓 {selectedHouse.teacher}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Members</span>
                <p className="font-bold text-slate-800 dark:text-white text-xs mt-0.5">{selectedHouse.members} students</p>
              </div>
            </div>

            <div className="space-y-1 text-slate-600 dark:text-slate-300 pt-1">
              <p>Tagline: <span className="italic text-slate-500">{selectedHouse.tagline || 'None'}</span></p>
              <p>Objective: <span className="text-slate-600 dark:text-slate-300">{selectedHouse.objective || 'None'}</span></p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg font-bold text-xs text-slate-700 dark:text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

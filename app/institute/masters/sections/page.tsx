'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, X, Search, Filter, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

interface SectionRecord {
  id: number
  sectionName: string
  className: string
  createdAt: string
  lastUpdate: string
  deleted: boolean
}

const INITIAL_SECTIONS: SectionRecord[] = []

export default function SectionsPage() {
  const [sections, setSections] = useState<SectionRecord[]>(INITIAL_SECTIONS)
  const [classList, setClassList] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'All' | 'Deleted'>('All')

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<SectionRecord | null>(null)

  // Form State
  const [sectionNameInput, setSectionNameInput] = useState('')
  const [targetClass, setTargetClass] = useState('')
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false)
  const [formError, setFormError] = useState('')

  // Filter Toggle state
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('')

  useEffect(() => {
    // Load sections
    const saved = localStorage.getItem('school_masters_sections')
    if (saved) {
      try {
        setSections(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_masters_sections', JSON.stringify(INITIAL_SECTIONS))
    }

    // Load classes dynamically (only non-deleted classes of the institute)
    const savedClasses = localStorage.getItem('school_masters_classes')
    if (savedClasses) {
      try {
        const parsed = JSON.parse(savedClasses)
        const activeClasses = parsed
          .filter((c: any) => !c.deleted)
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((c: any) => c.className)
        setClassList(activeClasses)
      } catch (e) {
        console.error(e)
      }
    } else {
      setClassList([])
    }
  }, [])

  const handleOpenAdd = () => {
    setSectionNameInput('')
    setTargetClass('')
    setSelectedClasses([])
    setIsClassDropdownOpen(false)
    setFormError('')
    setAddModalOpen(true)
  }

  const handleToggleSelectAllClasses = () => {
    if (selectedClasses.length === classList.length) {
      setSelectedClasses([])
    } else {
      setSelectedClasses([...classList])
    }
    if (formError) setFormError('')
  }

  const handleToggleClass = (cls: string) => {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    )
    if (formError) setFormError('')
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const trimmedSecName = sectionNameInput.trim().replace(/\s+/g, ' ')

    if (!trimmedSecName) {
      setFormError('Please enter a Section Name.')
      return
    }

    if (selectedClasses.length === 0) {
      setFormError('Please select at least one Class.')
      return
    }

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB') + '\n' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const newSections: SectionRecord[] = []
    let duplicateCount = 0

    selectedClasses.forEach((cls, idx) => {
      // Check duplicate section for the same class
      const isDuplicate = sections.some(
        s => !s.deleted && s.sectionName.trim().replace(/\s+/g, ' ').toLowerCase() === trimmedSecName.toLowerCase() && s.className.toLowerCase() === cls.toLowerCase()
      )
      if (isDuplicate) {
        duplicateCount++
      } else {
        newSections.push({
          id: Date.now() + idx,
          sectionName: trimmedSecName,
          className: cls,
          createdAt: dateStr,
          lastUpdate: dateStr,
          deleted: false
        })
      }
    })

    if (newSections.length === 0) {
      setFormError(`Section "${trimmedSecName}" already exists for all selected classes!`)
      return
    }

    const updated = [...newSections, ...sections]
    setSections(updated)
    localStorage.setItem('school_masters_sections', JSON.stringify(updated))

    setSectionNameInput('')
    setTargetClass('')
    setSelectedClasses([])
    setIsClassDropdownOpen(false)
    setFormError('')
    setAddModalOpen(false)

    if (duplicateCount > 0) {
      toast.success(`Section "${trimmedSecName}" added to ${newSections.length} class(es) (${duplicateCount} skipped as duplicate)!`)
    } else {
      toast.success(`Section "${trimmedSecName}" added to ${newSections.length} class(es) successfully!`)
    }
  }

  const handleOpenEdit = (item: SectionRecord) => {
    setSelectedSection(item)
    setSectionNameInput(item.sectionName)
    setTargetClass(item.className)
    setFormError('')
    setEditModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSection) return
    setFormError('')

    const trimmedSecName = sectionNameInput.trim().replace(/\s+/g, ' ')
    if (!trimmedSecName) {
      setFormError('Please enter a Section Name.')
      return
    }

    if (!targetClass) {
      setFormError('Please select a Class.')
      return
    }

    // Check duplicate section for the same class
    const isDuplicate = sections.some(
      s => !s.deleted && s.id !== selectedSection.id && s.sectionName.trim().replace(/\s+/g, ' ').toLowerCase() === trimmedSecName.toLowerCase() && s.className === targetClass
    )
    if (isDuplicate) {
      setFormError(`Section "${trimmedSecName}" already exists for ${targetClass}!`)
      return
    }

    const updated = sections.map(s => {
      if (s.id === selectedSection.id) {
        return {
          ...s,
          sectionName: trimmedSecName,
          className: targetClass,
          lastUpdate: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      }
      return s
    })

    setSections(updated)
    localStorage.setItem('school_masters_sections', JSON.stringify(updated))
    setEditModalOpen(false)
    setSelectedSection(null)
    setSectionNameInput('')
    setTargetClass('')
    setFormError('')
    toast.success('Section updated successfully!')
  }

  const handleDelete = (id: number) => {
    const updated = sections.map(s => s.id === id ? { ...s, deleted: true } : s)
    setSections(updated)
    localStorage.setItem('school_masters_sections', JSON.stringify(updated))
    toast.info('Section moved to deleted list!')
  }

  const handleRestore = (id: number) => {
    const updated = sections.map(s => s.id === id ? { ...s, deleted: false } : s)
    setSections(updated)
    localStorage.setItem('school_masters_sections', JSON.stringify(updated))
    toast.success('Section restored successfully!')
  }

  const tabCountAll = sections.filter(s => !s.deleted).length
  const tabCountDeleted = sections.filter(s => s.deleted).length

  // Filters logic
  const filtered = sections.filter(s => {
    const matchesTab = activeTab === 'All' ? !s.deleted : s.deleted
    const matchesSearch = searchQuery ? s.sectionName.toLowerCase().includes(searchQuery.toLowerCase()) : true
    const matchesClass = classFilter ? s.className === classFilter : true
    return matchesTab && matchesSearch && matchesClass
  })

  return (
    <div className="w-full pb-10 animate-in fade-in duration-300">
      
      {/* Single Unified Card */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-6">

        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h1 className="text-xl font-black text-slate-800">Sections</h1>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>

        {/* Tabs and Filter Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('All')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'All' ? 'bg-teal-600 text-white border-teal-500 font-black' : 'bg-white border text-slate-650 hover:bg-slate-50'}`}
            >
              All <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'All' ? 'bg-teal-750 text-white' : 'bg-slate-100 text-slate-600'}`}>{String(tabCountAll).padStart(2, '0')}</span>
            </button>
            <button
              onClick={() => setActiveTab('Deleted')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'Deleted' ? 'bg-teal-600 text-white border-teal-500 font-black' : 'bg-white border text-slate-655 hover:bg-slate-50'}`}
            >
              Deleted <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'Deleted' ? 'bg-teal-750 text-white' : 'bg-slate-100 text-slate-600'}`}>{String(tabCountDeleted).padStart(2, '0')}</span>
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-colors ${showFilters ? 'bg-slate-100 text-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {/* Toggleable Filters Panel */}
        {showFilters && (
          <div className="bg-slate-50 border rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 animate-in slide-in-from-top-3 duration-200">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Search Section</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search section name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Class</label>
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-bold text-xs"
              >
                <option value="">All Classes</option>
                {classList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4 text-left">Section Name</th>
                <th className="px-3 py-4 text-left">Class Name</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-800">{item.sectionName}</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-600">{item.className}</td>
                  <td className="px-3 py-3.5">
                    {activeTab === 'All' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(item.id)}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 mx-auto"
                        title="Restore"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">
                    No sections found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Section Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Create Section</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {formError && (
                <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-150">
                  <span>{formError}</span>
                  <button type="button" onClick={() => setFormError('')} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
                </div>
              )}
              
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-slate-500 font-bold">
                  Select Class <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                  className="w-full px-4 py-2 border rounded-lg outline-none bg-white font-bold focus:border-teal-500 flex items-center justify-between text-left text-xs text-slate-700"
                >
                  <span className="truncate">
                    {selectedClasses.length === 0
                      ? 'Select Class'
                      : selectedClasses.length === classList.length
                      ? `All Classes Selected (${selectedClasses.length})`
                      : selectedClasses.join(', ')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </button>

                {isClassDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsClassDropdownOpen(false)} 
                    />
                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto p-2 flex flex-col gap-1">
                      {classList.length > 0 ? (
                        <>
                          <div 
                            onClick={handleToggleSelectAllClasses}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer font-bold text-xs border-b border-slate-100 text-teal-600 select-none"
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedClasses.length === classList.length && classList.length > 0} 
                              onChange={() => {}} 
                              className="rounded accent-teal-600 pointer-events-none"
                            />
                            <span>Select All ({classList.length})</span>
                          </div>
                          {classList.map((cls, idx) => {
                            const isSelected = selectedClasses.includes(cls)
                            return (
                              <div 
                                key={idx}
                                onClick={() => handleToggleClass(cls)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer font-semibold text-xs text-slate-700 select-none"
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isSelected} 
                                  onChange={() => {}} 
                                  className="rounded accent-teal-600 pointer-events-none"
                                />
                                <span>{cls}</span>
                              </div>
                            )
                          })}
                        </>
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400 font-medium">
                          No classes found. Add classes in Masters first.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Enter Section Name</label>
                <input
                  type="text"
                  placeholder="e.g. A"
                  value={sectionNameInput}
                  onChange={e => {
                    setSectionNameInput(e.target.value)
                    if (formError) setFormError('')
                  }}
                  className="w-full px-4 py-2 border rounded-lg outline-none font-bold focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editModalOpen && selectedSection && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Edit Section</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-150">
                  <span>{formError}</span>
                  <button type="button" onClick={() => setFormError('')} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Class Name</label>
                <select
                  value={targetClass}
                  onChange={e => {
                    setTargetClass(e.target.value)
                    if (formError) setFormError('')
                  }}
                  className="w-full px-4 py-2 border rounded-lg outline-none bg-white font-bold focus:border-teal-500"
                >
                  <option value="">Select Class</option>
                  {classList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Section Name</label>
                <input
                  type="text"
                  placeholder="e.g. A"
                  value={sectionNameInput}
                  onChange={e => {
                    setSectionNameInput(e.target.value)
                    if (formError) setFormError('')
                  }}
                  className="w-full px-4 py-2 border rounded-lg outline-none font-bold focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

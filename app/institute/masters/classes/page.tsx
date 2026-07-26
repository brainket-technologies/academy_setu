'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, CheckCircle2, X, Search, Filter } from 'lucide-react'

interface ClassRecord {
  id: number
  className: string
  order: number
  description?: string
  sections: string[]
  totalStudents: number
  male: number
  female: number
  other: number
  lastUpdate: string
  deleted: boolean
}

const INITIAL_CLASSES: ClassRecord[] = [
  { id: 1, className: 'Class I', order: 1, description: 'Grade 1 primary class.', sections: ['A', 'B', 'C', 'D'], totalStudents: 35, male: 20, female: 15, other: 0, lastUpdate: '15/09/2025\n11:00 AM', deleted: false },
  { id: 2, className: 'Class II', order: 2, description: 'Grade 2 primary class.', sections: ['A', 'B'], totalStudents: 25, male: 15, female: 10, other: 0, lastUpdate: '15/09/2025\n11:00 AM', deleted: false },
  { id: 3, className: 'Class III', order: 3, description: 'Grade 3 primary class.', sections: ['A'], totalStudents: 27, male: 15, female: 12, other: 0, lastUpdate: '15/09/2025\n11:00 AM', deleted: false },
  { id: 4, className: 'Class IV', order: 4, description: 'Grade 4 primary class.', sections: ['A', 'B', 'C'], totalStudents: 30, male: 18, female: 12, other: 0, lastUpdate: '15/09/2025\n11:00 AM', deleted: true },
  { id: 5, className: 'Class V', order: 5, description: 'Grade 5 primary class.', sections: ['A', 'B'], totalStudents: 24, male: 14, female: 10, other: 0, lastUpdate: '15/09/2025\n11:00 AM', deleted: true },
]

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRecord[]>(INITIAL_CLASSES)
  const [activeTab, setActiveTab] = useState<'All' | 'Deleted'>('All')

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassRecord | null>(null)

  // Form State
  const [classNameInput, setClassNameInput] = useState('')
  const [rowOrder, setRowOrder] = useState('')
  const [description, setDescription] = useState('')
  const [classSections, setClassSections] = useState<string[]>(['A'])

  // Filter Toggle state
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sectionFilter, setSectionFilter] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_masters_classes')
    if (saved) {
      try {
        setClasses(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_masters_classes', JSON.stringify(INITIAL_CLASSES))
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classNameInput) {
      alert('Please enter a Class Name.')
      return
    }

    const newClass: ClassRecord = {
      id: Date.now(),
      className: classNameInput,
      order: parseInt(rowOrder) || (classes.length + 1),
      description,
      sections: classSections.length > 0 ? classSections : ['A'],
      totalStudents: 0,
      male: 0,
      female: 0,
      other: 0,
      lastUpdate: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      deleted: false
    }

    const updated = [newClass, ...classes]
    setClasses(updated)
    localStorage.setItem('school_masters_classes', JSON.stringify(updated))

    setClassNameInput('')
    setRowOrder('')
    setDescription('')
    setClassSections(['A'])
    setAddModalOpen(false)
    showToast('Class created successfully!')
  }

  const handleOpenEdit = (item: ClassRecord) => {
    setSelectedClass(item)
    setClassNameInput(item.className)
    setRowOrder(String(item.order))
    setDescription(item.description || '')
    setClassSections(item.sections)
    setEditModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !classNameInput) return

    const updated = classes.map(c => {
      if (c.id === selectedClass.id) {
        return {
          ...c,
          className: classNameInput,
          order: parseInt(rowOrder) || c.order,
          description,
          sections: classSections.length > 0 ? classSections : c.sections,
          lastUpdate: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      }
      return c
    })

    setClasses(updated)
    localStorage.setItem('school_masters_classes', JSON.stringify(updated))
    setEditModalOpen(false)
    setSelectedClass(null)
    setClassNameInput('')
    setRowOrder('')
    setDescription('')
    showToast('Class updated successfully!')
  }

  const handleDelete = (id: number) => {
    const updated = classes.map(c => c.id === id ? { ...c, deleted: true } : c)
    setClasses(updated)
    localStorage.setItem('school_masters_classes', JSON.stringify(updated))
    showToast('Class moved to deleted list!')
  }

  const handleRestore = (id: number) => {
    const updated = classes.map(c => c.id === id ? { ...c, deleted: false } : c)
    setClasses(updated)
    localStorage.setItem('school_masters_classes', JSON.stringify(updated))
    showToast('Class restored successfully!')
  }

  const toggleSectionCheckbox = (sec: string) => {
    if (classSections.includes(sec)) {
      setClassSections(classSections.filter(s => s !== sec))
    } else {
      setClassSections([...classSections, sec])
    }
  }

  const tabCountAll = classes.filter(c => !c.deleted).length
  const tabCountDeleted = classes.filter(c => c.deleted).length

  // Filters logic
  const filtered = classes.filter(c => {
    const matchesTab = activeTab === 'All' ? !c.deleted : c.deleted
    const matchesSearch = searchQuery ? c.className.toLowerCase().includes(searchQuery.toLowerCase()) : true
    const matchesSection = sectionFilter ? c.sections.includes(sectionFilter) : true
    return matchesTab && matchesSearch && matchesSection
  })

  const sectionColors: Record<string, string> = {
    A: 'bg-red-50 text-red-600 border-red-100',
    B: 'bg-blue-50 text-blue-600 border-blue-100',
    C: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    D: 'bg-purple-50 text-purple-600 border-purple-100'
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">Classes</h1>
        <button
          onClick={() => {
            setClassNameInput('')
            setRowOrder('')
            setDescription('')
            setClassSections(['A'])
            setAddModalOpen(true)
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class</span>
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
        <div className="bg-white border rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 animate-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Search Class</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search class name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Filter by Section</label>
            <select
              value={sectionFilter}
              onChange={e => setSectionFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-bold text-xs"
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4">Class</th>
                <th className="px-3 py-4">Section</th>
                <th className="px-3 py-4">Total Students</th>
                <th className="px-3 py-4">Male</th>
                <th className="px-3 py-4">Female</th>
                <th className="px-3 py-4">Other</th>
                <th className="px-3 py-4 w-36">Last Update</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 font-bold text-slate-800">{item.className}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {item.sections.map(sec => (
                        <span key={sec} className={`px-2 py-0.5 rounded text-[10px] font-black border ${sectionColors[sec] || 'bg-slate-50'}`}>
                          {sec}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3.5 font-bold text-slate-800">{item.totalStudents}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.male}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.female}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.other}</td>
                  <td className="px-3 py-3.5 text-slate-450 whitespace-pre-line leading-tight text-[10px]">
                    {item.lastUpdate}
                  </td>
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
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">
                    No classes found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Class Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-xl p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Create Class</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Class Name</label>
                  <input
                    type="text"
                    placeholder="Enter Class name"
                    value={classNameInput}
                    onChange={e => setClassNameInput(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg outline-none font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Row Per Order</label>
                  <input
                    type="number"
                    placeholder="Enter number"
                    value={rowOrder}
                    onChange={e => setRowOrder(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Assign Sections</label>
                <div className="flex items-center gap-4">
                  {['A', 'B', 'C', 'D'].map(sec => (
                    <label key={sec} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={classSections.includes(sec)}
                        onChange={() => toggleSectionCheckbox(sec)}
                        className="rounded text-teal-650 accent-teal-600"
                      />
                      <span>Section {sec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Description</label>
                <textarea
                  placeholder="Enter Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none h-20 font-bold resize-none"
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

      {/* Edit Class Modal */}
      {editModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-xl p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Edit Class Details</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Class Name</label>
                  <input
                    type="text"
                    placeholder="Enter Class name"
                    value={classNameInput}
                    onChange={e => setClassNameInput(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg outline-none font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Row Per Order</label>
                  <input
                    type="number"
                    placeholder="Enter number"
                    value={rowOrder}
                    onChange={e => setRowOrder(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Assign Sections</label>
                <div className="flex items-center gap-4">
                  {['A', 'B', 'C', 'D'].map(sec => (
                    <label key={sec} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={classSections.includes(sec)}
                        onChange={() => toggleSectionCheckbox(sec)}
                        className="rounded text-teal-650 accent-teal-600"
                      />
                      <span>Section {sec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Description</label>
                <textarea
                  placeholder="Enter Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none h-20 font-bold resize-none"
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

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

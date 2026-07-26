'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, CheckCircle2, X, Upload, Search, Filter } from 'lucide-react'

interface SubjectRecord {
  id: number
  subjectCode: string
  subjectName: string
  orderNo: number
  groupName: string
  className: string
  streamName: string
  type: 'Marks' | 'Grade (Activity)' | 'Grade (Discipline)'
  createdAt: string
  deleted: boolean
  description?: string
  subjectImage?: string
}

const INITIAL_SUBJECTS: SubjectRecord[] = [
  { id: 1, subjectCode: '03', subjectName: 'Physics', orderNo: 2, groupName: 'PCM', className: 'Class VIII', streamName: 'Science', type: 'Marks', createdAt: '15/09/2025\n11:00 AM', deleted: false },
  { id: 2, subjectCode: '04', subjectName: 'Zoology', orderNo: 3, groupName: 'ZBC', className: 'Class IX', streamName: 'Science', type: 'Grade (Discipline)', createdAt: '15/09/2025\n11:00 AM', deleted: false },
  { id: 3, subjectCode: '02', subjectName: 'Accounts', orderNo: 4, groupName: 'Accounts', className: 'Class VIII', streamName: 'Accounts', type: 'Grade (Activity)', createdAt: '14/09/2025\n11:00 AM', deleted: false },
  { id: 4, subjectCode: '05', subjectName: 'Chemistry', orderNo: 1, groupName: 'PCM', className: 'Class VIII', streamName: 'Science', type: 'Marks', createdAt: '15/09/2025\n11:00 AM', deleted: true },
]

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectRecord[]>(INITIAL_SUBJECTS)
  const [activeTab, setActiveTab] = useState<'All' | 'Deleted'>('All')

  // Dropdown master lists
  const [classList, setClassList] = useState<string[]>([])
  const [groupList, setGroupList] = useState<string[]>([])
  const [streamList, setStreamList] = useState<string[]>([])

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<SubjectRecord | null>(null)

  // Quick Create Subject Group State
  const [groupNameInput, setGroupNameInput] = useState('')

  // Form Fields State
  const [subjectName, setSubjectName] = useState('')
  const [subjectCode, setSubjectCode] = useState('')
  const [subjectGroup, setSubjectGroup] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedStream, setSelectedStream] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [subjectImage, setSubjectImage] = useState('')
  const [description, setDescription] = useState('')
  const [subjectType, setSubjectType] = useState<'Marks' | 'Grade (Activity)' | 'Grade (Discipline)'>('Marks')

  // Filter Toggle state
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    // Load subjects
    const saved = localStorage.getItem('school_masters_subjects')
    if (saved) {
      try { setSubjects(JSON.parse(saved)) } catch (e) { console.error(e) }
    } else {
      localStorage.setItem('school_masters_subjects', JSON.stringify(INITIAL_SUBJECTS))
    }

    // Load classes dynamically
    const savedClasses = localStorage.getItem('school_masters_classes')
    if (savedClasses) {
      try {
        const parsed = JSON.parse(savedClasses)
        setClassList(parsed.map((c: any) => c.className))
      } catch (e) { console.error(e) }
    } else {
      setClassList(['Class VIII', 'Class IX', 'Class X'])
    }

    // Load subject groups dynamically
    const savedGroups = localStorage.getItem('school_masters_subject_groups')
    if (savedGroups) {
      try {
        const parsed = JSON.parse(savedGroups)
        setGroupList(parsed.map((g: any) => g.groupName))
      } catch (e) { console.error(e) }
    } else {
      setGroupList(['PCM', 'ZBC', 'Accounts', 'General'])
    }

    // Load streams dynamically
    const savedStreams = localStorage.getItem('school_masters_streams')
    if (savedStreams) {
      try {
        const parsed = JSON.parse(savedStreams)
        setStreamList(parsed.map((s: any) => s.streamName))
      } catch (e) { console.error(e) }
    } else {
      setStreamList(['Science', 'Commerce', 'Arts'])
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  const handleQuickGroupCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupNameInput) return
    
    const savedGroups = localStorage.getItem('school_masters_subject_groups')
    let list = []
    if (savedGroups) {
      try { list = JSON.parse(savedGroups) } catch (err) { console.error(err) }
    }
    const newGroup = {
      id: Date.now(),
      groupName: groupNameInput.trim(),
      noOfSubjects: 0,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      deleted: false
    }
    const updated = [newGroup, ...list]
    localStorage.setItem('school_masters_subject_groups', JSON.stringify(updated))
    setGroupList(updated.map(g => g.groupName))
    setGroupNameInput('')
    showToast(`Subject Group "${newGroup.groupName}" created successfully!`)
  }

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectName || !subjectGroup || !selectedClass) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const newSub: SubjectRecord = {
      id: Date.now(),
      subjectCode: subjectCode || '01',
      subjectName,
      orderNo: parseInt(orderNumber) || 1,
      groupName: subjectGroup,
      className: selectedClass,
      streamName: selectedStream || 'General',
      type: subjectType,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      deleted: false,
      description,
      subjectImage
    }

    const updated = [newSub, ...subjects]
    setSubjects(updated)
    localStorage.setItem('school_masters_subjects', JSON.stringify(updated))

    // Reset Form
    setSubjectName('')
    setSubjectCode('')
    setSubjectGroup('')
    setSelectedClass('')
    setSelectedSection('')
    setSelectedStream('')
    setOrderNumber('')
    setSubjectImage('')
    setDescription('')
    setSubjectType('Marks')
    setCreateModalOpen(false)
    showToast('Subject created successfully!')
  }

  const handleOpenEdit = (sub: SubjectRecord) => {
    setSelectedSubject(sub)
    setSubjectName(sub.subjectName)
    setSubjectCode(sub.subjectCode)
    setSubjectGroup(sub.groupName)
    setSelectedClass(sub.className)
    setSelectedStream(sub.streamName)
    setOrderNumber(String(sub.orderNo))
    setSubjectImage(sub.subjectImage || '')
    setDescription(sub.description || '')
    setSubjectType(sub.type)
    setEditModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject || !subjectName || !selectedClass) return

    const updated = subjects.map(s => {
      if (s.id === selectedSubject.id) {
        return {
          ...s,
          subjectName,
          subjectCode,
          groupName: subjectGroup,
          className: selectedClass,
          streamName: selectedStream,
          orderNo: parseInt(orderNumber) || s.orderNo,
          type: subjectType,
          subjectImage,
          description
        }
      }
      return s
    })

    setSubjects(updated)
    localStorage.setItem('school_masters_subjects', JSON.stringify(updated))
    setEditModalOpen(false)
    setSelectedSubject(null)
    setSubjectName('')
    setSubjectCode('')
    setSubjectGroup('')
    setSelectedClass('')
    setSelectedStream('')
    setOrderNumber('')
    setSubjectImage('')
    setDescription('')
    showToast('Subject details updated successfully!')
  }

  const handleDelete = (id: number) => {
    const updated = subjects.map(s => s.id === id ? { ...s, deleted: true } : s)
    setSubjects(updated)
    localStorage.setItem('school_masters_subjects', JSON.stringify(updated))
    showToast('Subject moved to deleted list!')
  }

  const handleRestore = (id: number) => {
    const updated = subjects.map(s => s.id === id ? { ...s, deleted: false } : s)
    setSubjects(updated)
    localStorage.setItem('school_masters_subjects', JSON.stringify(updated))
    showToast('Subject restored successfully!')
  }

  const tabCountAll = subjects.filter(s => !s.deleted).length
  const tabCountDeleted = subjects.filter(s => s.deleted).length

  // Filter list
  const filtered = subjects.filter(s => {
    const matchesTab = activeTab === 'All' ? !s.deleted : s.deleted
    const matchesSearch = searchQuery ? (
      s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectCode.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true
    const matchesClass = classFilter ? s.className === classFilter : true
    return matchesTab && matchesSearch && matchesClass
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">Subjects</h1>
        <button
          onClick={() => {
            setSubjectName('')
            setSubjectCode('')
            setSubjectGroup(groupList[0] || '')
            setSelectedClass(classList[0] || '')
            setSelectedStream(streamList[0] || '')
            setOrderNumber('')
            setSubjectImage('')
            setDescription('')
            setCreateModalOpen(true)
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Create Subject Group Form card (inline PCM ZBC) */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm text-xs font-semibold text-slate-700">
        <h2 className="text-sm font-black text-[#1b3a60] mb-4">Create Subject Group</h2>
        <form onSubmit={handleQuickGroupCreate} className="flex items-end gap-4 max-w-lg">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-slate-500 font-bold">Subject Group Name</label>
            <input
              type="text"
              placeholder="Enter Subject Group name"
              value={groupNameInput}
              onChange={e => setGroupNameInput(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors"
          >
            Create
          </button>
        </form>
      </div>

      {/* Tabs and Filter Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('All')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'All' ? 'bg-teal-600 text-white border-teal-500 font-black' : 'bg-white border text-slate-655 hover:bg-slate-50'}`}
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
            <label className="text-slate-500 font-bold">Search Subject</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject code or name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Filter by Class</label>
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
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4">Subject Code</th>
                <th className="px-3 py-4">Subject Name</th>
                <th className="px-3 py-4">Order No.</th>
                <th className="px-3 py-4">Group</th>
                <th className="px-3 py-4">Class</th>
                <th className="px-3 py-4">Stream</th>
                <th className="px-3 py-4">Type</th>
                <th className="px-3 py-4 w-36">Create At</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 font-bold text-slate-800">{item.subjectCode}</td>
                  <td className="px-3 py-3.5 font-bold text-slate-850">{item.subjectName}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.orderNo}</td>
                  <td className="px-3 py-3.5 text-slate-700 font-black">{item.groupName}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.className}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.streamName}</td>
                  <td className="px-3 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${item.type === 'Marks' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-slate-500 text-[10px] whitespace-pre-line leading-tight">{item.createdAt}</td>
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
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-bold">
                    No subjects found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD SUBJECT POPUP MODAL ===== */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Add Subject</h3>
              <button onClick={() => setCreateModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Subject Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter Subject Name"
                    value={subjectName}
                    onChange={e => setSubjectName(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Subject Code</label>
                  <input
                    type="text"
                    placeholder="Enter Subject Code"
                    value={subjectCode}
                    onChange={e => setSubjectCode(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Subject Group <span className="text-red-500">*</span></label>
                  <select
                    value={subjectGroup}
                    onChange={e => setSubjectGroup(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    <option value="">Select Subject Group</option>
                    {groupList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Class <span className="text-red-500">*</span></label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    <option value="">Select Class</option>
                    {classList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Stream</label>
                  <select
                    value={selectedStream}
                    onChange={e => setSelectedStream(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    <option value="">Select Stream</option>
                    {streamList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Order Number</label>
                  <input
                    type="number"
                    placeholder="Enter Order Number"
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Subject Evaluation Type</label>
                <div className="flex items-center gap-6">
                  {['Marks', 'Grade (Activity)', 'Grade (Discipline)'].map(t => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="subtype"
                        checked={subjectType === t}
                        onChange={() => setSubjectType(t as any)}
                        className="accent-teal-600"
                      />
                      <span>{t}</span>
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
                  className="w-full px-3 py-2 border rounded-lg outline-none h-20 font-bold resize-none bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-6 py-2 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT SUBJECT POPUP MODAL ===== */}
      {editModalOpen && selectedSubject && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Edit Subject Details</h3>
              <button onClick={() => setEditModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Subject Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter Subject Name"
                    value={subjectName}
                    onChange={e => setSubjectName(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Subject Code</label>
                  <input
                    type="text"
                    placeholder="Enter Subject Code"
                    value={subjectCode}
                    onChange={e => setSubjectCode(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Subject Group <span className="text-red-500">*</span></label>
                  <select
                    value={subjectGroup}
                    onChange={e => setSubjectGroup(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    {groupList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Class <span className="text-red-500">*</span></label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    {classList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Stream</label>
                  <select
                    value={selectedStream}
                    onChange={e => setSelectedStream(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    {streamList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Order Number</label>
                  <input
                    type="number"
                    placeholder="Enter Order Number"
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Subject Evaluation Type</label>
                <div className="flex items-center gap-6">
                  {['Marks', 'Grade (Activity)', 'Grade (Discipline)'].map(t => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="subtype_edit"
                        checked={subjectType === t}
                        onChange={() => setSubjectType(t as any)}
                        className="accent-teal-600"
                      />
                      <span>{t}</span>
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
                  className="w-full px-3 py-2 border rounded-lg outline-none h-20 font-bold resize-none bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-6 py-2 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white"
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

'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, CheckCircle2, X, Upload, Search, Filter, BookOpen } from 'lucide-react'

interface BookRecord {
  id: number
  bookName: string
  className: string
  subjectName: string
  createdAt: string
  deleted: boolean
  bookImage?: string
}

interface SubjectItem {
  subjectName: string
  className: string
}

const INITIAL_BOOKS: BookRecord[] = []

export default function BooksPage() {
  const [books, setBooks] = useState<BookRecord[]>(INITIAL_BOOKS)
  const [activeTab, setActiveTab] = useState<'All' | 'Deleted'>('All')

  // Dynamic dropdowns
  const [classList, setClassList] = useState<string[]>([])
  const [subjectList, setSubjectList] = useState<string[]>([])
  const [allSubjects, setAllSubjects] = useState<SubjectItem[]>([])

  // Modal State
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null)

  // Add Book Form state
  const [bookNameInput, setBookNameInput] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [attachedImage, setAttachedImage] = useState('')

  // Filter Toggle state
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    // Load books
    const saved = localStorage.getItem('school_masters_books')
    if (saved) {
      try { setBooks(JSON.parse(saved)) } catch (e) { console.error(e) }
    } else {
      localStorage.setItem('school_masters_books', JSON.stringify(INITIAL_BOOKS))
    }

    // Load classes dynamically
    const savedClasses = localStorage.getItem('school_masters_classes')
    if (savedClasses) {
      try {
        const parsed = JSON.parse(savedClasses)
        const names = Array.isArray(parsed) ? parsed.filter((c: any) => !c.deleted).map((c: any) => c.className || c.name).filter(Boolean) : []
        setClassList(names.length ? names : ['Class VIII', 'Class IX', 'Class X'])
      } catch (e) { console.error(e) }
    } else {
      setClassList(['Class VIII', 'Class IX', 'Class X'])
    }

    // Load subjects dynamically
    const savedSubjects = localStorage.getItem('school_masters_subjects')
    if (savedSubjects) {
      try {
        const parsed = JSON.parse(savedSubjects)
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((s: any) => !s.deleted)
          setAllSubjects(valid.map((s: any) => ({
            subjectName: s.subjectName || s.name || '',
            className: s.className || ''
          })))
          const names = Array.from(new Set(valid.map((s: any) => s.subjectName || s.name).filter(Boolean)))
          setSubjectList(names)
        }
      } catch (e) { console.error(e) }
    } else {
      setSubjectList([])
      setAllSubjects([])
    }
  }, [])

  const getSubjectsForClass = (className: string) => {
    if (!className) return []
    const filtered = allSubjects
      .filter(s => s.className && s.className.trim().toLowerCase() === className.trim().toLowerCase())
      .map(s => s.subjectName)
      .filter(Boolean)
    return Array.from(new Set(filtered))
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAttachedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookNameInput.trim() || !selectedClass || !selectedSubject) {
      alert('Please fill in Book Name, Class, and Subject.')
      return
    }

    const newBook: BookRecord = {
      id: Date.now(),
      bookName: bookNameInput.trim(),
      className: selectedClass,
      subjectName: selectedSubject,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      deleted: false,
      bookImage: attachedImage.trim() || ''
    }

    const updated = [newBook, ...books]
    setBooks(updated)
    localStorage.setItem('school_masters_books', JSON.stringify(updated))

    // Reset Form
    setBookNameInput('')
    setSelectedClass('')
    setSelectedSubject('')
    setAttachedImage('')
    setAddModalOpen(false)
    showToast('Book registered successfully!')
  }

  const handleOpenEdit = (book: BookRecord) => {
    setSelectedBook(book)
    setBookNameInput(book.bookName || '')
    setSelectedClass(book.className || '')
    setSelectedSubject(book.subjectName || '')
    setAttachedImage(book.bookImage || '')
    setEditModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBook || !bookNameInput.trim() || !selectedClass || !selectedSubject) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const updated = books.map(b => {
      if (b.id === selectedBook.id) {
        return {
          ...b,
          bookName: bookNameInput.trim(),
          className: selectedClass,
          subjectName: selectedSubject,
          bookImage: attachedImage.trim()
        }
      }
      return b
    })

    setBooks(updated)
    localStorage.setItem('school_masters_books', JSON.stringify(updated))
    setEditModalOpen(false)
    setSelectedBook(null)
    setBookNameInput('')
    setSelectedClass('')
    setSelectedSubject('')
    setAttachedImage('')
    showToast('Book details updated successfully!')
  }

  const handleDelete = (id: number) => {
    const updated = books.map(b => b.id === id ? { ...b, deleted: true } : b)
    setBooks(updated)
    localStorage.setItem('school_masters_books', JSON.stringify(updated))
    showToast('Book moved to deleted list!')
  }

  const handleRestore = (id: number) => {
    const updated = books.map(b => b.id === id ? { ...b, deleted: false } : b)
    setBooks(updated)
    localStorage.setItem('school_masters_books', JSON.stringify(updated))
    showToast('Book restored successfully!')
  }

  const tabCountAll = books.filter(b => !b.deleted).length
  const tabCountDeleted = books.filter(b => b.deleted).length

  // Filter list
  const filtered = books.filter(b => {
    const matchesTab = activeTab === 'All' ? !b.deleted : b.deleted
    const matchesSearch = searchQuery ? b.bookName.toLowerCase().includes(searchQuery.toLowerCase()) : true
    const matchesClass = classFilter ? b.className === classFilter : true
    const matchesSubject = subjectFilter ? b.subjectName === subjectFilter : true
    return matchesTab && matchesSearch && matchesClass && matchesSubject
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">Books</h1>
        <button
          onClick={() => {
            setBookNameInput('')
            setSelectedClass('')
            setSelectedSubject('')
            setAttachedImage('')
            setAddModalOpen(true)
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Book</span>
        </button>
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
        <div className="bg-white border rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 animate-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Search Book</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search book name..."
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
              onChange={e => {
                const newClass = e.target.value
                setClassFilter(newClass)
                if (newClass) {
                  const allowed = getSubjectsForClass(newClass)
                  if (subjectFilter && !allowed.includes(subjectFilter)) {
                    setSubjectFilter('')
                  }
                }
              }}
              className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-bold text-xs"
            >
              <option value="">All Classes</option>
              {classList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Filter by Subject</label>
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-bold text-xs"
            >
              <option value="">All Subjects</option>
              {getSubjectsForClass(classFilter).map(s => (
                <option key={s} value={s}>{s}</option>
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
                <th className="px-3 py-4 text-left">Book Name</th>
                <th className="px-3 py-4">Class</th>
                <th className="px-3 py-4">Subject</th>
                <th className="px-3 py-4 w-36">Create At</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-10 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                        {item.bookImage ? (
                          <img src={item.bookImage} alt={item.bookName} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <span className="font-bold text-slate-800">{item.bookName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-slate-600 font-bold">{item.className}</td>
                  <td className="px-3 py-3.5 text-slate-600 font-bold">{item.subjectName}</td>
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
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                    No books found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD BOOK POPUP MODAL ===== */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Add Book</h3>
              <button onClick={() => setAddModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddBook} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-550 font-bold">Book Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter Book Name"
                  value={bookNameInput}
                  onChange={e => setBookNameInput(e.target.value)}
                  className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-550 font-bold">Class <span className="text-red-500">*</span></label>
                  <select
                    value={selectedClass}
                    onChange={e => {
                      const newClass = e.target.value
                      setSelectedClass(newClass)
                      const allowed = getSubjectsForClass(newClass)
                      if (!allowed.includes(selectedSubject)) {
                        setSelectedSubject('')
                      }
                    }}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                    required
                  >
                    <option value="">Select Class</option>
                    {classList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-550 font-bold">Subject <span className="text-red-500">*</span></label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                    required
                    disabled={!selectedClass || getSubjectsForClass(selectedClass).length === 0}
                  >
                    {!selectedClass ? (
                      <option value="">Select Class First</option>
                    ) : getSubjectsForClass(selectedClass).length === 0 ? (
                      <option value="">No subjects added for {selectedClass}</option>
                    ) : (
                      <>
                        <option value="">Select Subject</option>
                        {getSubjectsForClass(selectedClass).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Book Cover Image</label>
                <div className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  {attachedImage ? (
                    <div className="relative w-14 h-16 rounded-lg overflow-hidden border border-slate-300 shadow-sm shrink-0 bg-white">
                      <img src={attachedImage} alt="Book cover" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAttachedImage('')}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-16 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0 text-slate-400">
                      <BookOpen className="w-6 h-6 text-slate-300" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1 flex-1">
                    <label className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 cursor-pointer shadow-sm transition-colors w-fit">
                      <Upload className="w-3.5 h-3.5 text-teal-600" />
                      <span>{attachedImage ? 'Change Cover' : 'Upload Cover Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-slate-400 font-semibold">PNG, JPG or WebP (Max 5MB)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-6 py-2 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white"
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

      {/* ===== EDIT BOOK POPUP MODAL ===== */}
      {editModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Edit Book details</h3>
              <button onClick={() => setEditModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-550 font-bold">Book Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter Book Name"
                  value={bookNameInput}
                  onChange={e => setBookNameInput(e.target.value)}
                  className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-550 font-bold">Class <span className="text-red-500">*</span></label>
                  <select
                    value={selectedClass}
                    onChange={e => {
                      const newClass = e.target.value
                      setSelectedClass(newClass)
                      const allowed = getSubjectsForClass(newClass)
                      if (!allowed.includes(selectedSubject)) {
                        setSelectedSubject('')
                      }
                    }}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                    required
                  >
                    <option value="">Select Class</option>
                    {classList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-550 font-bold">Subject <span className="text-red-500">*</span></label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                    required
                    disabled={!selectedClass || getSubjectsForClass(selectedClass).length === 0}
                  >
                    {!selectedClass ? (
                      <option value="">Select Class First</option>
                    ) : getSubjectsForClass(selectedClass).length === 0 ? (
                      <option value="">No subjects added for {selectedClass}</option>
                    ) : (
                      <>
                        <option value="">Select Subject</option>
                        {getSubjectsForClass(selectedClass).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Book Cover Image</label>
                <div className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  {attachedImage ? (
                    <div className="relative w-14 h-16 rounded-lg overflow-hidden border border-slate-300 shadow-sm shrink-0 bg-white">
                      <img src={attachedImage} alt="Book cover" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAttachedImage('')}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-16 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0 text-slate-400">
                      <BookOpen className="w-6 h-6 text-slate-300" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1 flex-1">
                    <label className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 cursor-pointer shadow-sm transition-colors w-fit">
                      <Upload className="w-3.5 h-3.5 text-teal-600" />
                      <span>{attachedImage ? 'Change Cover' : 'Upload Cover Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-slate-400 font-semibold">PNG, JPG or WebP (Max 5MB)</span>
                  </div>
                </div>
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

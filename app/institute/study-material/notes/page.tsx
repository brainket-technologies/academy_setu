'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, Pencil, Trash2, Eye, X, CheckCircle2, Upload, FileText } from 'lucide-react'
import Link from 'next/link'

interface NoteRecord {
  id: number
  title: string
  className: string
  subjectName: string
  noOfContent: number
  createdAt: string
  description?: string
  attachmentName?: string
}

const INITIAL_NOTES: NoteRecord[] = [
]

export default function NotesPage() {
  const [view, setView] = useState<'list' | 'add'>('list')
  const [notes, setNotes] = useState<NoteRecord[]>(INITIAL_NOTES)
  const [searchQuery, setSearchQuery] = useState('')

  // Add Form state
  const [noteTitle, setNoteTitle] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [description, setDescription] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<string>('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_notes')
    if (saved) {
      try {
        setNotes(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_notes', JSON.stringify(INITIAL_NOTES))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Delete these notes?')) {
      const updated = notes.filter(n => n.id !== id)
      setNotes(updated)
      localStorage.setItem('school_notes', JSON.stringify(updated))
      showToast('Notes deleted successfully!')
    }
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteTitle || !selectedClass || !selectedSection || !selectedSubject || !attachmentFile) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const newNote: NoteRecord = {
      id: Date.now(),
      title: noteTitle,
      className: selectedClass,
      subjectName: selectedSubject,
      noOfContent: 1,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      description,
      attachmentName: attachmentFile
    }

    const updated = [newNote, ...notes]
    setNotes(updated)
    localStorage.setItem('school_notes', JSON.stringify(updated))

    // Reset Form
    setNoteTitle('')
    setSelectedClass('')
    setSelectedSection('')
    setSelectedSubject('')
    setDescription('')
    setAttachmentFile('')
    setView('list')
    showToast('Notes uploaded successfully!')
  }

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      {view === 'list' ? (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-800">Notes</h1>
              <p className="text-xs text-slate-400">Manage and distribute PDF / Image syllabus notes</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-56 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search by Name, Mobile no..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
                />
              </div>
              <button className="w-9 h-9 border rounded-xl flex items-center justify-center text-teal-600 hover:bg-slate-50 bg-white shadow-sm">
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('add')}
                className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 font-black text-slate-655 border-b">
                  <tr>
                    <th className="px-3 py-4 w-14">S. No.</th>
                    <th className="px-3 py-4 text-left">Title</th>
                    <th className="px-3 py-4">Image</th>
                    <th className="px-3 py-4">Class Name</th>
                    <th className="px-3 py-4">Subject Name</th>
                    <th className="px-3 py-4">No. of Content</th>
                    <th className="px-3 py-4 w-36">Created At</th>
                    <th className="px-3 py-4 w-24">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                      <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-800 max-w-[200px] truncate">{item.title}</td>
                      <td className="px-3 py-3.5">
                        <div className="w-8 h-8 mx-auto rounded bg-slate-150 flex items-center justify-center text-teal-600">
                          <FileText className="w-4 h-4" />
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">{item.className}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.subjectName}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.noOfContent}</td>
                      <td className="px-3 py-3.5 text-slate-450 whitespace-pre-line leading-tight text-[10px]">
                        {item.createdAt}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100">
                            <Eye className="w-3 h-3" />
                          </button>
                          <button className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                        No notes found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-slate-400 font-semibold">
              <p>Showing 1-{filtered.length} of {filtered.length} Entries</p>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">«</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">‹</button>
                <button className="w-7 h-7 rounded bg-teal-600 text-white flex items-center justify-center font-bold">1</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-500 hover:bg-slate-50">2</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">›</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">»</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ADD NOTES FORM */
        <div className="animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-black text-slate-800">Add Notes</h1>
              <p className="text-xs text-slate-400">Upload PDF or image study material notes</p>
            </div>
            <button
              onClick={() => setView('list')}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={handleUpload}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 text-xs font-semibold text-slate-700"
          >
            <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
              <legend className="px-3 text-sm font-black text-[#1b3a60]">Notes Information</legend>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">
                  Note Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Title"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white"
                  >
                    <option value="">Select Class</option>
                    {['Class I', 'Class II', 'Class III', 'Class IV', 'Class V'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSection}
                    onChange={e => setSelectedSection(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white"
                  >
                    <option value="">Select Section</option>
                    {['Section A', 'Section B', 'Section C'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white"
                  >
                    <option value="">Select Subject</option>
                    {['Hindi', 'Science', 'English', 'Mathematics'].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Description</label>
                <textarea
                  placeholder="Enter Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg font-bold outline-none h-24 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">
                  Attachment <span className="text-slate-400 font-normal text-[10px]">(You can upload PDF, JPEG, PNG, JPG & WEBP, max 10MB)</span> <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center border rounded-lg bg-slate-50 px-4 py-2.5">
                    <input
                      type="text"
                      placeholder="Upload file"
                      value={attachmentFile}
                      onChange={e => setAttachmentFile(e.target.value)}
                      className="w-full bg-transparent outline-none font-bold"
                    />
                    <Upload className="w-4 h-4 text-slate-400 ml-2" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachmentFile('notes_upload.pdf')}
                    className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 bg-white font-bold transition-all text-xs"
                  >
                    Attach
                  </button>
                </div>
              </div>
            </fieldset>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-teal-650 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md"
              >
                Upload
              </button>
            </div>
          </form>
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

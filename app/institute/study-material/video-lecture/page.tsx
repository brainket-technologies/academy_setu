'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, Pencil, Trash2, Eye, X, CheckCircle2, Film } from 'lucide-react'
import Link from 'next/link'

interface LectureRecord {
  id: number
  title: string
  thumbnail: string
  className: string
  subjectName: string
  noOfContent: number
  createdAt: string
  description?: string
  youtubeLink?: string
}

const INITIAL_LECTURES: LectureRecord[] = [
  { id: 1, title: 'Lorem ipsum dolor sit amet', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150', className: 'Class I', subjectName: 'Hindi', noOfContent: 2, createdAt: '15/09/2025\n11:00 AM', youtubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { id: 2, title: 'Lorem ipsum dolor sit amet', thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150', className: 'Class II', subjectName: 'Science', noOfContent: 2, createdAt: '15/09/2025\n11:00 AM', youtubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { id: 3, title: 'Lorem ipsum dolor sit amet', thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150', className: 'Class IV', subjectName: 'English', noOfContent: 1, createdAt: '15/09/2025\n11:00 AM', youtubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
]

export default function VideoLecturePage() {
  const [view, setView] = useState<'list' | 'add'>('list')
  const [lectures, setLectures] = useState<LectureRecord[]>(INITIAL_LECTURES)
  const [searchQuery, setSearchQuery] = useState('')

  // Add Form state
  const [lectureTitle, setLectureTitle] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeLink, setYoutubeLink] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_video_lectures')
    if (saved) {
      try {
        setLectures(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_video_lectures', JSON.stringify(INITIAL_LECTURES))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Delete this video lecture?')) {
      const updated = lectures.filter(l => l.id !== id)
      setLectures(updated)
      localStorage.setItem('school_video_lectures', JSON.stringify(updated))
      showToast('Video lecture deleted successfully!')
    }
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lectureTitle || !selectedClass || !selectedSection || !selectedSubject || !youtubeLink) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const newLecture: LectureRecord = {
      id: Date.now(),
      title: lectureTitle,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150',
      className: selectedClass,
      subjectName: selectedSubject,
      noOfContent: 1,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      description,
      youtubeLink
    }

    const updated = [newLecture, ...lectures]
    setLectures(updated)
    localStorage.setItem('school_video_lectures', JSON.stringify(updated))

    // Reset Form
    setLectureTitle('')
    setSelectedClass('')
    setSelectedSection('')
    setSelectedSubject('')
    setDescription('')
    setYoutubeLink('')
    setView('list')
    showToast('Video lecture uploaded successfully!')
  }

  const filtered = lectures.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      {view === 'list' ? (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-800">Video Lecture</h1>
              <p className="text-xs text-slate-400">Manage and distribute YouTube/Video lectures to classes</p>
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
                        <div className="relative w-12 h-8 mx-auto rounded overflow-hidden bg-slate-100 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Film className="w-4 h-4 text-red-650" />
                          </div>
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
                          {item.youtubeLink && (
                            <a
                              href={item.youtubeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100"
                            >
                              <Eye className="w-3 h-3" />
                            </a>
                          )}
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
                        No video lectures found.
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
        /* ADD LECTURE FORM */
        <div className="animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-black text-slate-800">Add Lecture</h1>
              <p className="text-xs text-slate-400">Upload and configure a new lecture reference</p>
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
              <legend className="px-3 text-sm font-black text-[#1b3a60]">Lecture Information</legend>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">
                  Lecture Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Title"
                  value={lectureTitle}
                  onChange={e => setLectureTitle(e.target.value)}
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
                  Add You Tube Video Link <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Paste YouTube Video Link"
                    value={youtubeLink}
                    onChange={e => setYoutubeLink(e.target.value)}
                    className="flex-1 px-4 py-2.5 border rounded-lg font-bold outline-none"
                  />
                  <button
                    type="button"
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

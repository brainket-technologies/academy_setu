'use client'

import React, { useState } from 'react'
import { ArrowLeft, X, Upload, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateEventPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [attachment, setAttachment] = useState('')

  const [toastOpen, setToastOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      alert('Please enter an event title.')
      return
    }

    const saved = localStorage.getItem('school_events_gallery')
    let eventsList = []
    if (saved) {
      try {
        eventsList = JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }

    const newEvent = {
      id: Date.now(),
      title,
      noOfImage: attachment ? 1 : 0,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      description,
      images: attachment ? ['https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300'] : []
    }

    const updated = [newEvent, ...eventsList]
    localStorage.setItem('school_events_gallery', JSON.stringify(updated))

    setToastOpen(true)
    setTimeout(() => {
      setToastOpen(false)
      router.push('/institute/gallery')
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/institute/gallery"
            className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-slate-50 text-slate-500 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800">Create Event</h1>
            <p className="text-xs text-slate-400">Add a new event gallery to the school record</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/institute/gallery')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 text-xs font-semibold text-slate-700"
      >
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Event Information</legend>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Title</label>
            <input
              type="text"
              placeholder="Enter Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Description</label>
            <textarea
              placeholder="Enter Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg font-bold outline-none h-28 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 max-w-lg">
            <label className="text-slate-500 font-bold">Attach File</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center border rounded-lg bg-slate-50 px-4 py-2.5">
                <input
                  type="text"
                  placeholder="Upload File"
                  value={attachment}
                  onChange={e => setAttachment(e.target.value)}
                  className="w-full bg-transparent outline-none font-bold"
                />
                <Upload className="w-4 h-4 text-slate-400 ml-2" />
              </div>
              <button
                type="button"
                onClick={() => setAttachment('event_image.jpg')}
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
            onClick={() => router.push('/institute/gallery')}
            className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md animate-pulse"
          >
            Save
          </button>
        </div>
      </form>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold font-bold">Event created successfully!</span>
        </div>
      )}
    </div>
  )
}

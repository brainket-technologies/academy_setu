'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, Plus, Eye, Pencil, Trash2, CheckCircle2, X, 
  Calendar, MapPin, Image as ImageIcon, Upload, LayoutGrid, 
  List, Tag, Sparkles, Filter, ExternalLink, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface EventGalleryRecord {
  id: number
  title: string
  category: string
  date: string
  venue?: string
  noOfImage: number
  createdAt: string
  description?: string
  coverImage?: string
  images?: string[]
}

const INITIAL_EVENTS: EventGalleryRecord[] = [
  {
    id: 1,
    title: 'Annual Sports Day 2026',
    category: 'Sports',
    date: '15/10/2026',
    venue: 'Main Athletic Stadium',
    noOfImage: 24,
    createdAt: '16/10/2026 10:30 AM',
    description: 'Annual inter-house track & field championship, relay races, and award ceremony.',
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 2,
    title: 'Cultural Festival & Talent Night',
    category: 'Cultural',
    date: '02/10/2026',
    venue: 'Institute Grand Auditorium',
    noOfImage: 18,
    createdAt: '03/10/2026 11:15 AM',
    description: 'Classical dances, musical choir performances, and stage drama by students.',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 3,
    title: 'Science & Robotics Exhibition',
    category: 'Academic',
    date: '18/09/2026',
    venue: 'Senior Science Block',
    noOfImage: 15,
    createdAt: '19/09/2026 02:45 PM',
    description: 'Working models of AI automation, solar energy, and robotics demonstrated by STEM club.',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
    ]
  }
]

const EVENT_CATEGORIES = ['All', 'Sports', 'Cultural', 'Academic', 'Annual Day', 'Celebration', 'Competition']

function AllEventsPageContent() {
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<EventGalleryRecord[]>(INITIAL_EVENTS)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventGalleryRecord | null>(null)
  const [selectedActivePhoto, setSelectedActivePhoto] = useState<string | null>(null)

  // Form State
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('Cultural')
  const [formDate, setFormDate] = useState('')
  const [formVenue, setFormVenue] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formImages, setFormImages] = useState<string[]>([])
  const [formNoOfImages, setFormNoOfImages] = useState(1)
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Check URL query param ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      handleOpenCreate()
    }
  }, [searchParams])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('school_events_gallery')
    if (saved) {
      try {
        setEvents(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_events_gallery', JSON.stringify(INITIAL_EVENTS))
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Helper to compress image before storing in state/localStorage
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 900
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = Math.round(width)
          canvas.height = Math.round(height)
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const fileList = Array.from(files)
      const compressedList = await Promise.all(fileList.map(f => compressImage(f)))
      const nextImages = [...formImages, ...compressedList]
      setFormImages(nextImages)
      if (!formImage && nextImages.length > 0) {
        setFormImage(nextImages[0])
      }
      setFormNoOfImages(nextImages.length)
      showToast(`${fileList.length} photo(s) selected!`)
    } catch (err) {
      console.error(err)
      showToast('Error reading image files.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const target = formImages[indexToRemove]
    const updated = formImages.filter((_, idx) => idx !== indexToRemove)
    setFormImages(updated)
    if (formImage === target) {
      setFormImage(updated[0] || '')
    }
    setFormNoOfImages(Math.max(1, updated.length))
  }

  const handleSetCoverImage = (img: string) => {
    setFormImage(img)
    showToast('Cover photo updated!')
  }

  const resetForm = () => {
    setEditingEventId(null)
    setFormTitle('')
    setFormCategory('Cultural')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormVenue('')
    setFormDescription('')
    setFormImage('')
    setFormImages([])
    setFormNoOfImages(1)
    setImageTab('upload')
  }

  const handleOpenCreate = () => {
    resetForm()
    setCreateModalOpen(true)
  }

  const handleOpenEdit = (event: EventGalleryRecord) => {
    setEditingEventId(event.id)
    setFormTitle(event.title)
    setFormCategory(event.category || 'Cultural')
    setFormDate(event.date || '')
    setFormVenue(event.venue || '')
    setFormDescription(event.description || '')
    setFormImage(event.coverImage || '')
    const imgs = event.images && event.images.length > 0 ? event.images : (event.coverImage ? [event.coverImage] : [])
    setFormImages(imgs)
    setFormNoOfImages(event.noOfImage || (imgs.length > 0 ? imgs.length : 1))
    setImageTab('upload')
    setCreateModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this event from the gallery?')) {
      const updated = events.filter(e => e.id !== id)
      setEvents(updated)
      localStorage.setItem('school_events_gallery', JSON.stringify(updated))
      if (selectedEvent?.id === id) setSelectedEvent(null)
      showToast('Event removed successfully!')
    }
  }

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      alert('Please enter an event title.')
      return
    }

    const defaultCover = formImage.trim() || (formImages.length > 0 ? formImages[0] : 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80')
    const finalImages = formImages.length > 0 ? formImages : [defaultCover]
    const finalCount = Math.max(formImages.length, formNoOfImages, 1)

    if (editingEventId) {
      const updated = events.map(ev => {
        if (ev.id === editingEventId) {
          return {
            ...ev,
            title: formTitle.trim(),
            category: formCategory,
            date: formDate,
            venue: formVenue.trim(),
            description: formDescription.trim(),
            coverImage: defaultCover,
            images: finalImages,
            noOfImage: finalCount
          }
        }
        return ev
      })
      setEvents(updated)
      localStorage.setItem('school_events_gallery', JSON.stringify(updated))
      showToast('Event updated successfully!')
    } else {
      const newEvent: EventGalleryRecord = {
        id: Date.now(),
        title: formTitle.trim(),
        category: formCategory,
        date: formDate || new Date().toLocaleDateString('en-GB'),
        venue: formVenue.trim() || 'School Campus',
        noOfImage: finalCount,
        createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        description: formDescription.trim(),
        coverImage: defaultCover,
        images: finalImages
      }
      const updated = [newEvent, ...events]
      setEvents(updated)
      localStorage.setItem('school_events_gallery', JSON.stringify(updated))
      showToast('Event created successfully!')
    }

    setCreateModalOpen(false)
    resetForm()
  }

  // Filtered list
  const filtered = useMemo(() => {
    return events.filter(ev => {
      if (selectedCategory !== 'All' && ev.category !== selectedCategory) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchTitle = ev.title.toLowerCase().includes(q)
        const matchVenue = ev.venue && ev.venue.toLowerCase().includes(q)
        const matchDesc = ev.description && ev.description.toLowerCase().includes(q)
        if (!matchTitle && !matchVenue && !matchDesc) return false
      }
      return true
    })
  }, [events, selectedCategory, searchQuery])

  // Summary Metrics
  const totalEvents = events.length
  const totalPhotos = events.reduce((acc, curr) => acc + (curr.noOfImage || 0), 0)
  const sportsCount = events.filter(e => e.category === 'Sports').length
  const culturalCount = events.filter(e => e.category === 'Cultural').length

  return (
    <div className="flex flex-col gap-5 w-full pb-10 animate-in fade-in duration-300">
      
      {/* ── TOP HEADER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Events Gallery</h1>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {totalEvents} events
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Archive school celebrations, competitions, annual days, and photo albums.</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Event in Modal Popup Button */}
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs hover:shadow-sm flex items-center justify-center gap-2 transition-all text-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* ── METRIC STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Events</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800 dark:text-white">{totalEvents}</div>
          <p className="text-[11px] text-teal-600 font-semibold mt-0.5">Recorded archives</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Photos</span>
            <ImageIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800 dark:text-white">{totalPhotos}</div>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">High-res memories</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Cultural & Arts</span>
            <Tag className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800 dark:text-white">{culturalCount}</div>
          <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Music & drama</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Sports Events</span>
            <Tag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800 dark:text-white">{sportsCount}</div>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Tournaments</p>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-semibold">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search events, venue, description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold text-slate-800 dark:text-slate-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {EVENT_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── VIEW 1: CARD GRID VIEW (VISUAL GALLERY) ── */}
      {viewMode === 'grid' && (
        <>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(item => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                >
                  {/* Card Cover Image with Overlay */}
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <img
                      src={item.coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Category Tag */}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/90 text-slate-800 shadow-xs backdrop-blur-xs">
                      {item.category || 'Event'}
                    </span>

                    {/* Photos Count Tag */}
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/60 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-teal-400" />
                      <span>{item.noOfImage} photos</span>
                    </span>

                    {/* Title on banner */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-black text-sm line-clamp-1 drop-shadow-sm">{item.title}</h3>
                      <div className="flex items-center gap-3 text-[11px] text-white/90 mt-0.5 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {item.date}
                        </span>
                        {item.venue && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3" /> {item.venue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs">
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {item.description || 'No description provided.'}
                    </p>

                    {/* Card Actions Footer */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(item)}
                        className="flex-1 py-1.5 px-3 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Album</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                        title="Edit Event"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto text-2xl shadow-2xs mb-3">
                📷
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white">No Events Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {searchQuery || selectedCategory !== 'All'
                  ? 'No events matched your search or category filter.'
                  : 'Start showcasing your institute sports, cultural, and academic events.'}
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create First Event</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ── VIEW 2: TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto text-xs font-semibold text-slate-700 dark:text-slate-300">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-xs">
                <tr>
                  <th className="px-4 py-3.5 w-14 text-center">S. No.</th>
                  <th className="px-4 py-3.5">Event Title & Venue</th>
                  <th className="px-4 py-3.5 w-28">Category</th>
                  <th className="px-4 py-3.5 w-28">Event Date</th>
                  <th className="px-4 py-3.5 w-28 text-center">Photos</th>
                  <th className="px-4 py-3.5 w-32">Created At</th>
                  <th className="px-4 py-3.5 w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold">
                {filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}.</td>
                    
                    {/* Event Title & Cover */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=100&auto=format&fit=crop&q=80'}
                          alt={item.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">{item.title}</div>
                          {item.venue && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" /> {item.venue}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300">
                        {item.category || 'General'}
                      </span>
                    </td>

                    {/* Event Date */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-bold">
                      {item.date}
                    </td>

                    {/* Photos Count */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs">
                        <ImageIcon className="w-3.5 h-3.5 text-teal-600" /> {item.noOfImage}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {item.createdAt}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(item)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                          title="Edit Event"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          CREATE / EDIT EVENT MODAL POPUP
      ════════════════════════════════════════════════════════════════ */}
      {createModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200 max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-850 dark:text-white">
                    {editingEventId ? 'Edit Event Gallery' : 'Create Event in Gallery'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Add photos and details for school album archive.</p>
                </div>
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
            <form onSubmit={handleSaveEvent} className="space-y-3.5 overflow-y-auto pr-1">
              
              {/* Event Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annual Sports Day, Science Fair, Independence Day"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 outline-none focus:border-teal-500 transition-colors"
                  required
                />
              </div>

              {/* Row: Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 outline-none focus:border-teal-500 transition-colors"
                  >
                    {EVENT_CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-xs bg-white dark:bg-slate-900 outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Row: Venue & Photo Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. School Auditorium, Sports Field"
                    value={formVenue}
                    onChange={e => setFormVenue(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-xs bg-white dark:bg-slate-900 outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Number of Photos in Album
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={formNoOfImages}
                    onChange={e => setFormNoOfImages(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-xs bg-white dark:bg-slate-900 outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Event Highlights & Description
                </label>
                <textarea
                  placeholder="Describe student achievements, special guests, performances..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold outline-none h-20 resize-none bg-white dark:bg-slate-900 text-xs focus:border-teal-500 transition-colors"
                />
              </div>

              {/* Photos & Cover Image Upload / Selection */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Event Photos & Cover Photo <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10.5px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        imageTab === 'upload'
                          ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Upload Files
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        imageTab === 'url'
                          ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Hidden Real File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  multiple
                  onChange={handleFilesChosen}
                  className="hidden"
                />

                {imageTab === 'upload' ? (
                  <div className="space-y-2">
                    {/* Interactive Dropzone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault()
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          const pseudoEvent = {
                            target: { files: e.dataTransfer.files }
                          } as unknown as React.ChangeEvent<HTMLInputElement>
                          handleFilesChosen(pseudoEvent)
                        }
                      }}
                      className="border-2 border-dashed border-teal-300 dark:border-teal-700 hover:border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50/70 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isUploading ? 'Processing images...' : 'Click to select photos or drag & drop here'}
                      </p>
                      <p className="text-[10.5px] text-slate-400 mt-0.5">
                        PNG, JPG, WEBP • Select one or multiple photos
                      </p>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                        className="mt-2.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Choose Photos from Device
                      </button>
                    </div>

                    {/* Uploaded Photos Thumbnails & Cover Selector */}
                    {formImages.length > 0 && (
                      <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span>Selected Photos ({formImages.length})</span>
                          <span className="text-[10px] text-teal-600">Click photo to set as Cover Photo</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-1">
                          {formImages.map((img, idx) => {
                            const isCover = formImage === img || (!formImage && idx === 0)
                            return (
                              <div
                                key={idx}
                                onClick={() => handleSetCoverImage(img)}
                                className={`relative group h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                  isCover ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                {isCover && (
                                  <span className="absolute top-1 left-1 bg-teal-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                                    Cover
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleRemoveImage(idx)
                                  }}
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove photo"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add more photos
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* URL Input Mode */
                  <div className="space-y-2">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden focus-within:border-teal-500 transition-colors">
                      <input
                        type="text"
                        placeholder="Paste image URL (https://...)"
                        value={formImage}
                        onChange={e => {
                          setFormImage(e.target.value)
                          if (e.target.value && !formImages.includes(e.target.value)) {
                            setFormImages([e.target.value, ...formImages])
                          }
                        }}
                        className="flex-1 px-3.5 py-2 outline-none bg-transparent font-semibold text-xs text-slate-800 dark:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const sample = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80'
                          setFormImage(sample)
                          setFormImages([sample])
                        }}
                        className="px-3.5 py-2 border-l border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-teal-600 hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Sample Image</span>
                      </button>
                    </div>
                    {formImage && (
                      <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <img src={formImage} alt="Preview" className="w-12 h-9 rounded object-cover border" />
                        <span className="text-[11px] text-slate-500 font-semibold truncate flex-1">{formImage}</span>
                        <button type="button" onClick={() => setFormImage('')} className="text-rose-500 hover:text-rose-700">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs text-xs transition-colors cursor-pointer"
                >
                  {editingEventId ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          VIEW EVENT GALLERY DETAILS MODAL POPUP
      ════════════════════════════════════════════════════════════════ */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200 max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {selectedEvent.category}
                </span>
                <h3 className="text-base font-black text-slate-850 dark:text-white mt-1">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Photo Cover */}
            <div className="relative h-60 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
              <img
                src={selectedActivePhoto || selectedEvent.coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'}
                alt={selectedEvent.title}
                className="w-full h-full object-cover transition-all"
              />
              <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>{selectedEvent.noOfImage} Photos in Album</span>
              </span>
            </div>

            {/* Album Photos Thumbnails Strip (if multiple) */}
            {selectedEvent.images && selectedEvent.images.length > 1 && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Album Photos</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {selectedEvent.images.map((img, idx) => {
                    const isSelected = (selectedActivePhoto || selectedEvent.coverImage) === img
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedActivePhoto(img)}
                        className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          isSelected ? 'border-teal-500 ring-2 ring-teal-500/20 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Album photo ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Event Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" /> {selectedEvent.date}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Venue</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {selectedEvent.venue || 'School Campus'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">About this Event</span>
              <p className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs leading-relaxed">
                {selectedEvent.description || 'No detailed description available.'}
              </p>
            </div>

            {/* Footer Action */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  handleDelete(selectedEvent.id)
                }}
                className="px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Album</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(selectedEvent)
                    setSelectedEvent(null)
                  }}
                  className="px-4 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Event</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

export default function AllEventsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-400 font-semibold text-xs">Loading Events Gallery...</div>}>
      <AllEventsPageContent />
    </React.Suspense>
  )
}

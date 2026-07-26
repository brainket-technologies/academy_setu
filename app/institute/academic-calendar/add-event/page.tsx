'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, X, Pencil, Trash2, CheckCircle2 } from 'lucide-react'

interface CalendarEventRecord {
  id: number
  name: string
  type: 'Holiday' | 'Event'
  date: string
  details: 'Confirmed' | 'Tentative'
  location: string
  createdAt: string
}

const INITIAL_EVENTS: CalendarEventRecord[] = [
  { id: 1, name: 'Event Title', type: 'Holiday', date: '28/04/2025', details: 'Confirmed', location: 'Location Name', createdAt: '15/09/2025 11:00 AM' },
  { id: 2, name: 'Event Title', type: 'Holiday', date: '28/04/2025', details: 'Tentative', location: 'Location Name', createdAt: '15/09/2025 11:00 AM' },
  { id: 3, name: 'Event Title', type: 'Event', date: '28/04/2025', details: 'Confirmed', location: 'Location Name', createdAt: '15/09/2025 11:00 AM' },
]

const CLASSES = ['Class I','Class II','Class III','Class IV','Class V','Class VI','Class VII','Class VIII','Class IX','Class X']

export default function AddEventPage() {
  const [events, setEvents] = useState<CalendarEventRecord[]>(INITIAL_EVENTS)

  // Form state
  const [eventType, setEventType] = useState<'Holiday' | 'Event' | ''>('')
  const [eventName, setEventName] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [duration, setDuration] = useState<'single' | 'multiple'>('single')
  const [singleDate, setSingleDate] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [timeEnabled, setTimeEnabled] = useState(false)
  const [fromTime, setFromTime] = useState('')
  const [toTime, setToTime] = useState('')
  const [isConfirmed, setIsConfirmed] = useState<'yes' | 'tentative'>('yes')
  const [dependsOn, setDependsOn] = useState('')
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['Class V', 'Class VI'])
  const [location, setLocation] = useState('')

  // Filter state
  const [filterType, setFilterType] = useState('')
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_calendar_events')
    if (saved) {
      try { setEvents(JSON.parse(saved)) } catch (e) { console.error(e) }
    } else {
      localStorage.setItem('school_calendar_events', JSON.stringify(INITIAL_EVENTS))
    }
  }, [])

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls])
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventType || !eventName) {
      alert('Please fill in Event Type and Name.')
      return
    }

    const newEvent: CalendarEventRecord = {
      id: Date.now(),
      name: eventName,
      type: eventType,
      date: duration === 'single' ? (singleDate ? new Date(singleDate).toLocaleDateString('en-GB') : '28/04/2025') : (fromDate ? new Date(fromDate).toLocaleDateString('en-GB') : '28/04/2025'),
      details: isConfirmed === 'yes' ? 'Confirmed' : 'Tentative',
      location: location || 'Location Name',
      createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }

    const updated = [...events, newEvent]
    setEvents(updated)
    localStorage.setItem('school_calendar_events', JSON.stringify(updated))

    // Reset
    setEventType('')
    setEventName('')
    setEventDescription('')
    setSingleDate('')
    setFromDate('')
    setToDate('')
    setFromTime('')
    setToTime('')
    setLocation('')
    setIsConfirmed('yes')
    setDuration('single')
    setTimeEnabled(false)

    setToastMsg('Event created successfully!')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this event?')) {
      const updated = events.filter(ev => ev.id !== id)
      setEvents(updated)
      localStorage.setItem('school_calendar_events', JSON.stringify(updated))
    }
  }

  const filtered = events.filter(ev => {
    if (filterType && ev.type !== filterType) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Add Academic Event</h1>
        <p className="text-xs text-slate-400">Create holidays, events, and school calendar entries</p>
      </div>

      {/* ===== Add Event Form ===== */}
      <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 text-xs font-semibold text-slate-700">

        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Add Event</legend>

          {/* Row 1: Event Type, Name, Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Event Type <span className="text-red-500">*</span></label>
              <select value={eventType} onChange={e => setEventType(e.target.value as 'Holiday' | 'Event')} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white">
                <option value="">Select Type</option>
                <option value="Holiday">Holiday</option>
                <option value="Event">Event</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">{eventType === 'Holiday' ? 'Holiday Name' : 'Event Title'} <span className="text-red-500">*</span></label>
              <input type="text" placeholder={eventType === 'Holiday' ? 'Enter Holiday Name' : 'Enter Event Title'} value={eventName} onChange={e => setEventName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">{eventType === 'Holiday' ? 'Holiday Description' : 'Event Description'}</label>
              <input type="text" placeholder="Enter Description" value={eventDescription} onChange={e => setEventDescription(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-slate-500 font-bold">Duration <span className="text-slate-400 text-[10px] font-normal">(How many days the {eventType === 'Holiday' ? 'holiday' : 'event'} will be active?)</span></label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="duration" checked={duration === 'single'} onChange={() => setDuration('single')} className="accent-teal-600 w-4 h-4" />
                <span className="font-bold">Single Day</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="duration" checked={duration === 'multiple'} onChange={() => setDuration('multiple')} className="accent-teal-600 w-4 h-4" />
                <span className="font-bold">Multiple Day</span>
              </label>
            </div>
          </div>

          {/* Date */}
          {duration === 'single' ? (
            <div className="flex flex-col gap-1.5 max-w-xs">
              <label className="text-slate-500 font-bold">Date</label>
              <input type="date" value={singleDate} onChange={e => setSingleDate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 max-w-lg">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">From Date</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">To Date</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
              </div>
            </div>
          )}

          {/* Time toggle (for Event type) */}
          {eventType === 'Event' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <label className="text-slate-500 font-bold">Time</label>
                <button
                  type="button"
                  onClick={() => setTimeEnabled(!timeEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${timeEnabled ? 'bg-teal-500' : 'bg-slate-300'}`}
                >
                  <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200" style={{ left: timeEnabled ? '22px' : '2px' }} />
                </button>
              </div>
              {timeEnabled && (
                <div className="grid grid-cols-2 gap-6 max-w-lg">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">From Time</label>
                    <input type="time" value={fromTime} onChange={e => setFromTime(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">To Time</label>
                    <input type="time" value={toTime} onChange={e => setToTime(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Is Confirmed? */}
          <div className="flex flex-wrap items-start gap-8">
            <div>
              <label className="text-slate-500 font-bold">Is Confirmed?</label>
              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="confirmed" checked={isConfirmed === 'yes'} onChange={() => setIsConfirmed('yes')} className="accent-teal-600 w-4 h-4" />
                  <span className="font-bold">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="confirmed" checked={isConfirmed === 'tentative'} onChange={() => setIsConfirmed('tentative')} className="accent-teal-600 w-4 h-4" />
                  <span className="font-bold">No, it&apos;s tentative</span>
                </label>
              </div>
            </div>
            {isConfirmed === 'tentative' && (
              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <label className="text-slate-500 font-bold">Depends On</label>
                <select value={dependsOn} onChange={e => setDependsOn(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white">
                  <option value="">Select an Option</option>
                  <option value="Government Orders">Government Orders</option>
                  <option value="Moon">Moon</option>
                  <option value="Administrative">Administrative</option>
                </select>
              </div>
            )}
          </div>

          {/* Class */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Class</label>
            <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border rounded-lg min-h-[42px]">
              {selectedClasses.map(cls => (
                <span key={cls} className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] font-bold border border-teal-200">
                  {cls}
                  <button type="button" onClick={() => toggleClass(cls)} className="text-teal-500 hover:text-teal-700"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <select onChange={e => { if (e.target.value) toggleClass(e.target.value); e.target.value = '' }} className="text-[10px] font-bold outline-none bg-transparent text-slate-400 cursor-pointer">
                <option value="">+ Add Class</option>
                {CLASSES.filter(c => !selectedClasses.includes(c)).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Send Notification */}
          <div className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50">
            <span className="font-bold text-slate-700">Send Notification Parents / Students / Teacher / Employee App?</span>
            <button type="button" className="px-5 py-1.5 border border-teal-500 text-teal-600 rounded-lg font-bold hover:bg-teal-50 transition-colors">Send</button>
          </div>

          {/* Location/Venue (Event type) */}
          {eventType === 'Event' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Location/Venue</label>
              <textarea placeholder="Ex. School Auditorium, Hostel Building, etc." value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 border rounded-lg font-bold outline-none h-16 resize-none" />
            </div>
          )}

        </fieldset>

        <div className="flex justify-center pt-2">
          <button type="submit" className="px-10 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md">Create</button>
        </div>

      </form>

      {/* ===== All Calendar Events Table ===== */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-black text-[#1b3a60]">All Calendar Events</h2>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400">Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border rounded-lg text-xs font-bold outline-none bg-white min-w-[140px]">
              <option value="">Select or Search</option>
              <option value="Holiday">Holiday</option>
              <option value="Event">Event</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400">From Date</label>
            <input type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} className="px-3 py-2 border rounded-lg text-xs font-bold outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400">To Date</label>
            <input type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} className="px-3 py-2 border rounded-lg text-xs font-bold outline-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Name</th>
                <th className="px-4 py-4">Type</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Details</th>
                <th className="px-4 py-4 text-left">Location</th>
                <th className="px-4 py-4 w-40">Created At</th>
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-800">{item.name}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.type}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.date}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      item.details === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {item.details}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-left text-slate-600">{item.location}</td>
                  <td className="px-4 py-3.5 text-slate-450 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1"><span>📅</span><span>{item.createdAt}</span></div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => handleDelete(item.id)} className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400 font-bold">No events found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOAST */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Calendar, Clock, Trash2, X, Download, CheckCircle2 } from 'lucide-react'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'

interface TimeSlot {
  id: number
  timeFrom: string
  timeTo: string
  subject: string
  teacher: string
  isLunchBreak?: boolean
}

interface DaySchedule {
  [dayName: string]: TimeSlot[]
}

interface TimetableRecord {
  id: string
  classes: string
  section: string
  schedule: DaySchedule
}

const DEFAULT_SCHEDULE: DaySchedule = {
  'Monday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Maths', teacher: 'Teacher Name' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'English', teacher: 'Teacher Name' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Hindi', teacher: 'Teacher Name' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'Science', teacher: 'Teacher Name' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'GK', teacher: 'Teacher Name' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'Computer', teacher: 'Teacher Name' },
  ],
  'Tuesday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'English', teacher: 'Teacher Name' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'Hindi', teacher: 'Teacher Name' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Science', teacher: 'Teacher Name' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'GK', teacher: 'Teacher Name' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'Computer', teacher: 'Teacher Name' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'Maths', teacher: 'Teacher Name' },
  ],
  'Wednesday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Hindi', teacher: 'Teacher Name' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'GK', teacher: 'Teacher Name' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Maths', teacher: 'Teacher Name' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'Computer', teacher: 'Teacher Name' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'Science', teacher: 'Teacher Name' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'English', teacher: 'Teacher Name' },
  ],
  'Thursday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Maths', teacher: 'Teacher Name' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'English', teacher: 'Teacher Name' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Hindi', teacher: 'Teacher Name' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'Science', teacher: 'Teacher Name' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'GK', teacher: 'Teacher Name' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'Computer', teacher: 'Teacher Name' },
  ],
  'Friday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'English', teacher: 'Teacher Name' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'Hindi', teacher: 'Teacher Name' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Science', teacher: 'Teacher Name' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'GK', teacher: 'Teacher Name' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'Computer', teacher: 'Teacher Name' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'Maths', teacher: 'Teacher Name' },
  ],
  'Saturday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Hindi', teacher: 'Teacher Name' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'GK', teacher: 'Teacher Name' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Maths', teacher: 'Teacher Name' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'Computer', teacher: 'Teacher Name' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'Science', teacher: 'Teacher Name' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'English', teacher: 'Teacher Name' },
  ],
}

const PASTEL_COLORS = [
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-sky-50 text-sky-700 border-sky-100',
  'bg-rose-50 text-rose-700 border-rose-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-amber-50 text-amber-700 border-amber-100',
]

export default function TimeTablePage() {
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()
  
  const [records, setRecords] = useState<TimetableRecord[]>([])
  const [selectedClass, setSelectedClass] = useState('Class V')
  const [selectedSection, setSelectedSection] = useState('Section A')

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [activeModalDay, setActiveModalDay] = useState('Monday')
  const [modalClass, setModalClass] = useState('')
  const [modalSection, setModalSection] = useState('')

  // Modal form states
  const [modalSlots, setModalSlots] = useState<Record<string, any[]>>({
    'Monday': [],
    'Tuesday': [],
    'Wednesday': [],
    'Thursday': [],
    'Friday': [],
    'Saturday': []
  })

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load schedules
  useEffect(() => {
    const saved = localStorage.getItem('school_timetables')
    if (saved) {
      try {
        setRecords(JSON.parse(saved))
      } catch (err) {
        console.error(err)
      }
    } else {
      const initial: TimetableRecord[] = [
        { id: '1', classes: 'Class V', section: 'Section A', schedule: DEFAULT_SCHEDULE }
      ]
      setRecords(initial)
      localStorage.setItem('school_timetables', JSON.stringify(initial))
    }
  }, [])

  // Find active schedule
  const activeRecord = records.find(r => r.classes === selectedClass && r.section === selectedSection)
  const activeSchedule = activeRecord ? activeRecord.schedule : DEFAULT_SCHEDULE

  // Modal slot actions
  const addSubjectRow = () => {
    const current = [...(modalSlots[activeModalDay] || [])]
    const nextId = Date.now()
    setModalSlots({
      ...modalSlots,
      [activeModalDay]: [
        ...current,
        { id: nextId, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: '', teacher: '' }
      ]
    })
  }

  const addLunchBreakRow = () => {
    const current = [...(modalSlots[activeModalDay] || [])]
    const nextId = Date.now()
    setModalSlots({
      ...modalSlots,
      [activeModalDay]: [
        ...current,
        { id: nextId, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true }
      ]
    })
  }

  const deleteSlotRow = (id: number) => {
    const current = [...(modalSlots[activeModalDay] || [])]
    setModalSlots({
      ...modalSlots,
      [activeModalDay]: current.filter(s => s.id !== id)
    })
  }

  const handleSlotFieldChange = (idx: number, field: keyof TimeSlot, value: string) => {
    const current = [...(modalSlots[activeModalDay] || [])]
    current[idx] = {
      ...current[idx],
      [field]: value
    }
    setModalSlots({
      ...modalSlots,
      [activeModalDay]: current
    })
  }

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalClass || !modalSection) {
      alert('Please select Class and Section.')
      return
    }

    const newRecord: TimetableRecord = {
      id: Date.now().toString(),
      classes: modalClass,
      section: modalSection,
      schedule: modalSlots as DaySchedule
    }

    const updated = [...records.filter(r => !(r.classes === modalClass && r.section === modalSection)), newRecord]
    setRecords(updated)
    localStorage.setItem('school_timetables', JSON.stringify(updated))

    setSelectedClass(modalClass)
    setSelectedSection(modalSection)
    setAddModalOpen(false)

    setToastMsg(`Time Table saved for ${modalClass} (${modalSection})!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const MODAL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Retrieve maximum periods to format rows consistently
  const maxSlotsCount = Math.max(...DAYS.map(day => (activeSchedule[day] || []).length))

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 font-extrabold">Time Table</h1>
          <p className="text-xs text-slate-400 font-medium">Verify weekly lecture schedules and class coordinators</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('Exporting time table PDF format...')}
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white shadow-sm"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setModalClass(selectedClass)
              setModalSection(selectedSection)
              setModalSlots(activeSchedule)
              setAddModalOpen(true)
            }}
            className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selectors card (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-semibold text-slate-700">
        <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
          <div className="flex flex-col gap-1 w-44">
            <label className="text-slate-500 font-bold">Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none">
              <option value="">Select a Class</option>
              {classesData.map((c: any) => (
                <option key={c.className} value={c.className}>{c.className}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-44">
            <label className="text-slate-500 font-bold">Section</label>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none">
              <option value="">Select a Section</option>
              {sectionsData.map((s: any) => (
                <option key={s.sectionName} value={s.sectionName}>{s.sectionName}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          onClick={() => {
            setModalClass(selectedClass)
            setModalSection(selectedSection)
            setModalSlots(activeSchedule)
            setAddModalOpen(true)
          }}
          className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors whitespace-nowrap self-end md:self-center"
        >
          Setup School Days
        </button>
      </div>

      {/* Weekly Schedule Grid (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[1000px] grid grid-cols-6 gap-4 text-xs font-semibold">
          
          {/* Day Headers */}
          {DAYS.map(day => (
            <div key={day} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center font-black text-[#1b3a60] dark:bg-slate-700/50">
              {day}
            </div>
          ))}

          {/* Slots Dynamic Grid row logic */}
          {Array.from({ length: maxSlotsCount }).map((_, slotIdx) => {
            
            // Check if ANY day at this slotIdx is a Lunch Break
            const isRowLunchBreak = DAYS.some(day => {
              const slot = (activeSchedule[day] || [])[slotIdx]
              return slot && slot.isLunchBreak
            })

            if (isRowLunchBreak) {
              // Retrieve Lunch Break duration
              const lunchSlot = DAYS.map(d => (activeSchedule[d] || [])[slotIdx]).find(s => s && s.isLunchBreak)
              const timeRange = lunchSlot ? `${lunchSlot.timeFrom} - ${lunchSlot.timeTo}` : '11:15 AM - 12:00 PM'

              return (
                <div key={`lunch-${slotIdx}`} className="col-span-6 bg-blue-600 rounded-xl p-3.5 text-white font-black flex items-center justify-between shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-2 z-10">
                    <Clock className="w-4 h-4 text-white/80" />
                    <span>{timeRange}</span>
                  </div>
                  <div className="flex-1 text-center select-none tracking-widest text-[11px] z-10 opacity-90 uppercase">
                    - Lunch Break - Lunch Break - Lunch Break - Lunch Break - Lunch Break - Lunch Break -
                  </div>
                </div>
              )
            }

            return (
              <React.Fragment key={`slot-row-${slotIdx}`}>
                {DAYS.map(day => {
                  const slot = (activeSchedule[day] || [])[slotIdx]
                  if (!slot) {
                    return <div key={`${day}-${slotIdx}`} className="min-h-[90px] border border-dashed border-slate-200 rounded-2xl bg-slate-50/20" />
                  }

                  const colorClass = PASTEL_COLORS[slotIdx % PASTEL_COLORS.length]

                  return (
                    <div key={`${day}-${slotIdx}`} className={`border rounded-2xl p-4 space-y-2 shadow-sm transition-all hover:shadow-md ${colorClass}`}>
                      <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase opacity-75">
                        <Clock className="w-3 h-3" />
                        <span>{slot.timeFrom} - {slot.timeTo}</span>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-[11px] leading-tight">Subject: {slot.subject}</h4>
                        <p className="text-[10px] opacity-80">Teacher: {slot.teacher}</p>
                      </div>
                    </div>
                  )
                })}
              </React.Fragment>
            )
          })}

        </div>
      </div>

      {/* ================================== ADD TIME TABLE MODAL OVERLAY (Screenshot 2) ================================== */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 relative p-8 space-y-6">
            
            <button 
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 uppercase tracking-wider">
              Add Time Table
            </h2>

            <form onSubmit={handleSaveModal} className="space-y-6 text-xs font-semibold text-slate-700">
              
              {/* Class & Section row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Class *</label>
                  <select value={modalClass} onChange={e => setModalClass(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold" required>
                    <option value="">Select Class</option>
                    {classesData.map((c: any) => (
                      <option key={c.className} value={c.className}>{c.className}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Section *</label>
                  <select value={modalSection} onChange={e => setModalSection(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold" required>
                    <option value="">Select Section</option>
                    {sectionsData.map((s: any) => (
                      <option key={s.sectionName} value={s.sectionName}>{s.sectionName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Day Tab Switcher (Screenshot 2) */}
              <div className="border-b border-slate-200 flex flex-nowrap overflow-x-auto gap-4">
                {MODAL_DAYS.map(day => (
                  <button 
                    key={day}
                    type="button"
                    onClick={() => setActiveModalDay(day)}
                    className={`py-3 px-1 border-b-2 text-xs font-black transition-colors whitespace-nowrap ${
                      activeModalDay === day ? 'border-teal-600 text-teal-650' : 'border-transparent text-slate-400 hover:text-teal-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Day builder border box (Screenshot 2) */}
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-6">
                
                {/* Dynamically mapped period cards */}
                {(modalSlots[activeModalDay] || []).map((slot, idx) => {
                  
                  if (slot.isLunchBreak) {
                    return (
                      <div key={slot.id} className="p-4 border border-blue-100 bg-blue-50/40 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Lunch Break row</span>
                          <button 
                            type="button" 
                            onClick={() => deleteSlotRow(slot.id)}
                            className="p-1 rounded hover:bg-red-50 text-red-500 border border-transparent hover:border-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-slate-500 font-bold">Time From *</label>
                            <select value={slot.timeFrom} onChange={e => handleSlotFieldChange(idx, 'timeFrom', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-semibold">
                              <option value="11:15 AM">11:15 AM</option>
                              <option value="12:00 PM">12:00 PM</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-slate-500 font-bold">Time To *</label>
                            <select value={slot.timeTo} onChange={e => handleSlotFieldChange(idx, 'timeTo', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-semibold">
                              <option value="12:00 PM">12:00 PM</option>
                              <option value="12:45 PM">12:45 PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={slot.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border-b pb-4 last:border-b-0 last:pb-0">
                      
                      <div className="flex flex-col gap-1.5 col-span-1">
                        <label className="text-slate-500 font-bold">Subject *</label>
                        <select 
                          value={slot.subject} 
                          onChange={e => handleSlotFieldChange(idx, 'subject', e.target.value)} 
                          className="w-full px-4 py-2 border rounded-lg outline-none font-bold" 
                          required 
                        >
                          <option value="">Select Subject</option>
                          {subjectsData.map((s: any) => (
                            <option key={s.subjectName} value={s.subjectName}>{s.subjectName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 col-span-1">
                        <label className="text-slate-500 font-bold">Teacher *</label>
                        <select value={slot.teacher} onChange={e => handleSlotFieldChange(idx, 'teacher', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-semibold" required>
                          <option value="">Select Teacher</option>
                          <option value="Teacher Name">Teacher Name</option>
                          <option value="Coordinator Name">Coordinator Name</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 col-span-1">
                        <label className="text-slate-500 font-bold">Time From *</label>
                        <select value={slot.timeFrom} onChange={e => handleSlotFieldChange(idx, 'timeFrom', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-semibold" required>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="09:45 AM">09:45 AM</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="12:45 PM">12:45 PM</option>
                          <option value="01:30 PM">01:30 PM</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 col-span-1">
                        <label className="text-slate-500 font-bold">Time To *</label>
                        <select value={slot.timeTo} onChange={e => handleSlotFieldChange(idx, 'timeTo', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-semibold" required>
                          <option value="09:45 AM">09:45 AM</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="11:15 AM">11:15 AM</option>
                          <option value="12:45 PM">12:45 PM</option>
                          <option value="01:30 PM">01:30 PM</option>
                          <option value="02:15 PM">02:15 PM</option>
                        </select>
                      </div>

                      <div className="flex justify-center col-span-1">
                        <button 
                          type="button" 
                          onClick={() => deleteSlotRow(slot.id)}
                          className="p-2 rounded bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-colors w-full flex items-center justify-center gap-1.5 font-bold"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>

                    </div>
                  )
                })}

                {/* Inner actions */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <button 
                    type="button" 
                    onClick={addLunchBreakRow}
                    className="px-4 py-2 border border-teal-200 text-teal-650 bg-white hover:bg-teal-50 rounded-lg font-bold shadow-sm"
                  >
                    + Add Lunch Break
                  </button>
                  <button 
                    type="button" 
                    onClick={addSubjectRow}
                    className="px-4 py-2 border border-teal-200 text-teal-650 bg-white hover:bg-teal-50 rounded-lg font-bold shadow-sm"
                  >
                    + Add Subject
                  </button>
                </div>

              </div>

              {/* Bottom outer Save button */}
              <div className="flex justify-center pt-4">
                <button 
                  type="submit"
                  className="px-10 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md"
                >
                  Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TOAST ALERT */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

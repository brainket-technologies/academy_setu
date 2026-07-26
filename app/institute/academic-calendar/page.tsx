'use client'

import React, { useState } from 'react'
import { Search, Filter, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type ViewMode = 'Day' | 'Week' | 'Month'

interface CalendarEvent {
  id: number
  name: string
  type: 'Holiday' | 'Event' | 'Weekoff'
  date: string
  time?: string
  color: string
}

const EVENTS: CalendarEvent[] = [
  { id: 1, name: 'Annual Function', type: 'Event', date: '2026-04-01', time: '08:00 AM', color: '#0d9488' },
  { id: 2, name: 'Fee Day\nParents Teachers Meeting', type: 'Event', date: '2026-04-03', time: '08:00 AM', color: '#dc2626' },
  { id: 3, name: 'Extra Class', type: 'Event', date: '2026-04-09', time: '10:00 AM', color: '#eab308' },
  { id: 4, name: 'Activity Training', type: 'Event', date: '2026-04-14', time: '09:00 AM', color: '#6366f1' },
  { id: 5, name: 'Festival Holiday', type: 'Holiday', date: '2026-04-23', color: '#eab308' },
  { id: 6, name: 'Half Day', type: 'Holiday', date: '2026-04-25', color: '#64748b' },
]

const HOURS = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM']
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate()
}
function getFirstDayOfMonth(y: number, m: number) {
  return new Date(y, m, 1).getDay()
}

export default function AcademicCalendarPage() {
  const [view, setView] = useState<ViewMode>('Week')
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026
  const [categoryFilter, setCategoryFilter] = useState('Category')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const day = currentDate.getDate()

  const navigate = (dir: number) => {
    const d = new Date(currentDate)
    if (view === 'Day') d.setDate(d.getDate() + dir)
    else if (view === 'Week') d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setCurrentDate(d)
  }

  const getWeekDates = () => {
    const d = new Date(currentDate)
    const dayOfWeek = d.getDay()
    d.setDate(d.getDate() - dayOfWeek)
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(d)
      dd.setDate(dd.getDate() + i)
      return dd
    })
  }

  const getEventsForDate = (dateStr: string) => EVENTS.filter(e => e.date === dateStr)

  const formatDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

  // Header label
  const headerLabel = view === 'Day'
    ? `${day} ${MONTH_NAMES[month]}, ${year}`
    : view === 'Week'
      ? `${MONTH_NAMES[month]}, ${year}`
      : `${MONTH_NAMES[month]}, ${year}`

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">Academic Calendar</h1>
          <p className="text-xs text-slate-400">View school events, holidays and weekly schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-56 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input type="text" placeholder="Search by Name, Mobile no..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold" />
          </div>
          <button className="w-9 h-9 border rounded-xl flex items-center justify-center text-teal-600 hover:bg-slate-50 bg-white shadow-sm"><Filter className="w-4 h-4" /></button>
          <button className="w-9 h-9 border rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white shadow-sm"><Download className="w-4 h-4" /></button>
          <Link href="/institute/academic-calendar/add-event" className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"><Plus className="w-4 h-4" /></Link>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">

        {/* View Tabs + Legend */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {(['Day','Week','Month'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${view === v ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{v}</button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Holiday</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Event</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Weekoff</span>
          </div>
        </div>

        {/* Navigation + Date */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-800">{headerLabel}</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-slate-50"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
            <button onClick={() => navigate(1)} className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-slate-50"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Calendar Grid */}
          <div className="flex-1 overflow-auto">

            {/* ===== DAY VIEW ===== */}
            {view === 'Day' && (
              <div className="border rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 bg-slate-50 border-b text-[10px] font-black text-slate-500 uppercase">
                  <div className="px-3 py-2 border-r">Time</div>
                  <div className="px-3 py-2 col-span-3">{DAYS[currentDate.getDay()]} {String(day).padStart(2,'0')}</div>
                </div>
                {HOURS.map(hour => {
                  const evts = getEventsForDate(formatDateStr(currentDate)).filter(e => e.time === hour)
                  return (
                    <div key={hour} className="grid grid-cols-4 border-b last:border-0 min-h-[56px]">
                      <div className="px-3 py-2 border-r text-[10px] font-bold text-slate-400">{hour}</div>
                      <div className="col-span-3 p-1.5 flex flex-wrap gap-1">
                        {evts.map(ev => (
                          <div key={ev.id} className="px-2.5 py-1.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: ev.color }}>
                            {ev.name.split('\n')[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ===== WEEK VIEW ===== */}
            {view === 'Week' && (() => {
              const weekDates = getWeekDates()
              return (
                <div className="border rounded-xl overflow-hidden">
                  <div className="grid" style={{ gridTemplateColumns: '70px repeat(7, 1fr)' }}>
                    <div className="bg-slate-50 border-b border-r px-2 py-2 text-[10px] font-black text-slate-400" />
                    {weekDates.map((d, i) => (
                      <div key={i} className="bg-slate-50 border-b border-r last:border-r-0 px-2 py-2 text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase">{DAYS[i]}</div>
                        <div className="text-xs font-black text-slate-700">{String(d.getDate()).padStart(2,'0')}</div>
                      </div>
                    ))}
                  </div>
                  {HOURS.map(hour => (
                    <div key={hour} className="grid border-b last:border-0 min-h-[52px]" style={{ gridTemplateColumns: '70px repeat(7, 1fr)' }}>
                      <div className="px-2 py-2 border-r text-[10px] font-bold text-slate-400">{hour}</div>
                      {weekDates.map((d, i) => {
                        const evts = getEventsForDate(formatDateStr(d)).filter(e => e.time === hour)
                        return (
                          <div key={i} className="border-r last:border-r-0 p-1">
                            {evts.map(ev => (
                              <div key={ev.id} className="px-1.5 py-1 rounded text-[9px] font-bold text-white truncate" style={{ backgroundColor: ev.color }}>
                                {ev.name.split('\n')[0]}
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* ===== MONTH VIEW ===== */}
            {view === 'Month' && (() => {
              const daysInMonth = getDaysInMonth(year, month)
              const firstDay = getFirstDayOfMonth(year, month)
              const prevMonthDays = getDaysInMonth(year, month - 1)
              const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

              const cells: { day: number; isCurrentMonth: boolean; date: Date }[] = []
              for (let i = 0; i < totalCells; i++) {
                if (i < firstDay) {
                  const d = prevMonthDays - firstDay + i + 1
                  cells.push({ day: d, isCurrentMonth: false, date: new Date(year, month - 1, d) })
                } else if (i < firstDay + daysInMonth) {
                  const d = i - firstDay + 1
                  cells.push({ day: d, isCurrentMonth: true, date: new Date(year, month, d) })
                } else {
                  const d = i - firstDay - daysInMonth + 1
                  cells.push({ day: d, isCurrentMonth: false, date: new Date(year, month + 1, d) })
                }
              }

              return (
                <div className="border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-7 bg-slate-50 border-b">
                    {DAYS.map(d => (
                      <div key={d} className="px-2 py-2 text-center text-[10px] font-black text-slate-400 uppercase border-r last:border-r-0">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {cells.map((cell, i) => {
                      const evts = getEventsForDate(formatDateStr(cell.date))
                      return (
                        <div key={i} className={`border-r border-b last:border-r-0 min-h-[80px] p-1.5 ${!cell.isCurrentMonth ? 'bg-slate-50/60' : 'bg-white'}`}>
                          <div className={`text-[10px] font-bold mb-1 ${cell.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}>{cell.day}</div>
                          <div className="space-y-0.5">
                            {evts.map(ev => (
                              <div key={ev.id} className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white truncate" style={{ backgroundColor: ev.color }}>
                                {ev.name.split('\n')[0]}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Events Sidebar Panel */}
          <div className="w-56 flex-shrink-0 hidden lg:block">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-700">Events</h3>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="text-[10px] font-bold border rounded-lg px-2 py-1 outline-none">
                <option>Category</option>
                <option>Category 1</option>
                <option>Category 2</option>
                <option>Category 3</option>
                <option>Category 4</option>
              </select>
            </div>
            <div className="space-y-2.5">
              {EVENTS.map(ev => (
                <div key={ev.id} className="flex gap-2.5 p-2.5 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow bg-white">
                  <div className="w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-800 truncate">{ev.name.split('\n')[0]}</p>
                    {ev.name.includes('\n') && <p className="text-[9px] text-slate-400 truncate">{ev.name.split('\n')[1]}</p>}
                    <p className="text-[9px] text-slate-400 mt-0.5">📅 {ev.date} {ev.time && `· ${ev.time}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

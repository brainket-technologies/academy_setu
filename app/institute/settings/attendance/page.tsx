'use client'

import React, { useState } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'

export default function AttendanceSettingsPage() {
  // Timing
  const [punchIn, setPunchIn] = useState('08:00')
  const [punchOut, setPunchOut] = useState('14:30')
  const [maxPunchOut, setMaxPunchOut] = useState('17:00')

  // Late
  const [lateTitle1, setLateTitle1] = useState('Late')
  const [lateAfter1, setLateAfter1] = useState('08:15')
  const [lateTitle2, setLateTitle2] = useState('Half-day')
  const [lateAfter2, setLateAfter2] = useState('09:30')

  // Absent
  const [absentStudent, setAbsentStudent] = useState('09:00')
  const [absentTeacher, setAbsentTeacher] = useState('09:00')

  const [toastOpen, setToastOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Attendance</h1>
      </div>

      <div className="bg-white border rounded-3xl p-8 shadow-sm text-xs font-semibold text-slate-700">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Timing Section */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-black text-[#1b3a60] pb-2 border-b w-full mb-4">Timing</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Punch In Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={punchIn}
                    onChange={e => setPunchIn(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold bg-white text-slate-750"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Punch Out Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={punchOut}
                    onChange={e => setPunchOut(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold bg-white text-slate-750"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Max. Punch Out Time <span className="text-slate-400 font-normal">(After which punch out is restricted for student/teacher)</span></label>
                <div className="relative">
                  <input
                    type="time"
                    value={maxPunchOut}
                    onChange={e => setMaxPunchOut(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold bg-white text-slate-750"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-colors text-[10px]"
              >
                Save
              </button>
            </div>
          </fieldset>

          {/* Mark Late Section */}
          <fieldset className="space-y-4 pt-4 border-t border-slate-200">
            <legend className="text-xs font-black text-[#1b3a60] pb-2 border-b w-full mb-4">Mark Late</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3 border p-4 rounded-xl bg-slate-50">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Title</label>
                  <input
                    type="text"
                    value={lateTitle1}
                    onChange={e => setLateTitle1(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white outline-none font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Mark After</label>
                  <input
                    type="time"
                    value={lateAfter1}
                    onChange={e => setLateAfter1(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border p-4 rounded-xl bg-slate-50">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Title</label>
                  <input
                    type="text"
                    value={lateTitle2}
                    onChange={e => setLateTitle2(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white outline-none font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Mark After</label>
                  <input
                    type="time"
                    value={lateAfter2}
                    onChange={e => setLateAfter2(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white outline-none font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-colors text-[10px]"
              >
                Save
              </button>
            </div>
          </fieldset>

          {/* Mark Absent Section */}
          <fieldset className="space-y-4 pt-4 border-t border-slate-200">
            <legend className="text-xs font-black text-[#1b3a60] pb-2 border-b w-full mb-4">Mark Absent</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Auto Mark Student Absent</label>
                <input
                  type="time"
                  value={absentStudent}
                  onChange={e => setAbsentStudent(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold bg-white text-slate-750"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Auto Mark Teacher Absent</label>
                <input
                  type="time"
                  value={absentTeacher}
                  onChange={e => setAbsentTeacher(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold bg-white text-slate-750"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-colors text-[10px]"
              >
                Save
              </button>
            </div>
          </fieldset>

        </form>
      </div>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">Attendance settings updated successfully!</span>
        </div>
      )}
    </div>
  )
}

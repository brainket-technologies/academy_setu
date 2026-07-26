'use client'

import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface ToggleRowProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border border-slate-200 rounded-xl bg-white">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-teal-500' : 'bg-slate-300'}`}
      >
        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200" style={{ left: checked ? '22px' : '2px' }} />
      </button>
    </div>
  )
}

export default function AppNotificationPage() {
  const [punchInTime, setPunchInTime] = useState('05:00 am')
  const [punchOutTime, setPunchOutTime] = useState('00:00 PM')
  const [missPunchOutTime, setMissPunchOutTime] = useState('06:00 AM')

  // Timing
  const [sendPunchIn, setSendPunchIn] = useState(false)
  const [sendPunchOut, setSendPunchOut] = useState(false)

  // Mark Late
  const [markLateTitle1] = useState('Last Mark')
  const [markLateAfter1, setMarkLateAfter1] = useState('00:00 AM')
  const [markLateTitle2] = useState('Half Day')
  const [markLateAfter2, setMarkLateAfter2] = useState('8:00 AM')
  const [sendMarkLate, setSendMarkLate] = useState(false)

  // Mark Absent
  const [autoMarkStudentAbsent, setAutoMarkStudentAbsent] = useState('09:00 AM')
  const [autoMarkTeacherAbsent, setAutoMarkTeacherAbsent] = useState('09:00 AM')
  const [sendMarkAbsent, setSendMarkAbsent] = useState(false)

  // Auto App Notification
  const [sendAbsentNotif, setSendAbsentNotif] = useState(false)
  const [sendPresentNotif, setSendPresentNotif] = useState(false)
  const [sendPresentStaffNotif, setSendPresentStaffNotif] = useState(false)

  // Home Work Notification
  const [sendHomeworkParents, setSendHomeworkParents] = useState(false)
  const [sendHomeworkTeachers, setSendHomeworkTeachers] = useState(false)
  const [sendHomeworkCheck, setSendHomeworkCheck] = useState(false)

  // Defaulter Notification
  const [sendDefaulter, setSendDefaulter] = useState(false)

  // Birthday Notification
  const [sendBirthdayStudents, setSendBirthdayStudents] = useState(false)
  const [sendBirthdayStaff, setSendBirthdayStaff] = useState(false)
  const [preferredBirthdayTime, setPreferredBirthdayTime] = useState(false)

  const [toastOpen, setToastOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">App Notification</h1>
        <p className="text-xs text-slate-400">Configure app push notification triggers</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-8 text-xs font-semibold text-slate-700">

        {/* Timing */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Timing</legend>
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold text-[10px]">Punch In Time</label>
              <input type="text" value={punchInTime} onChange={e => setPunchInTime(e.target.value)} className="px-4 py-2.5 border rounded-lg font-bold outline-none w-40 bg-teal-50 text-teal-700" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold text-[10px]">Punch Out Time</label>
              <input type="text" value={punchOutTime} onChange={e => setPunchOutTime(e.target.value)} className="px-4 py-2.5 border rounded-lg font-bold outline-none w-40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold text-[10px]">Miss Punch Out Time</label>
              <p className="text-[9px] text-slate-400">If student hasn&apos;t punched out by this time.</p>
              <input type="text" value={missPunchOutTime} onChange={e => setMissPunchOutTime(e.target.value)} className="px-4 py-2.5 border rounded-lg font-bold outline-none w-40 bg-slate-800 text-white" />
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <ToggleRow label="Send Punched In App Notification to parents/students." checked={sendPunchIn} onChange={setSendPunchIn} />
            <ToggleRow label="Send Punched Out App Notification to parents/students." checked={sendPunchOut} onChange={setSendPunchOut} />
          </div>
        </fieldset>

        {/* Mark Late */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Mark Late</legend>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-bold text-[10px]">Title (What do you want to call it as?)</label>
              <input type="text" value={markLateTitle1} readOnly className="px-4 py-2.5 border rounded-lg font-bold outline-none bg-teal-50 text-teal-700" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-bold text-[10px]">Mark After</label>
              <input type="text" value={markLateAfter1} onChange={e => setMarkLateAfter1(e.target.value)} className="px-4 py-2.5 border rounded-lg font-bold outline-none bg-slate-800 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-bold text-[10px]">Title (What do you want to call it as?)</label>
              <input type="text" value={markLateTitle2} readOnly className="px-4 py-2.5 border rounded-lg font-bold outline-none bg-teal-50 text-teal-700" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-bold text-[10px]">Mark After</label>
              <input type="text" value={markLateAfter2} onChange={e => setMarkLateAfter2(e.target.value)} className="px-4 py-2.5 border rounded-lg font-bold outline-none bg-slate-800 text-white" />
            </div>
          </div>
          <ToggleRow label="Send Mark Late App Notification to parents/students." checked={sendMarkLate} onChange={setSendMarkLate} />
        </fieldset>

        {/* Mark Absent */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Mark Absent</legend>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-bold text-[10px]">Auto Mark Student Absent</label>
              <input type="text" value={autoMarkStudentAbsent} onChange={e => setAutoMarkStudentAbsent(e.target.value)} className="px-4 py-2.5 border rounded-lg font-bold outline-none bg-teal-50 text-teal-700" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-bold text-[10px]">Auto Mark Teacher Absent</label>
              <input type="text" value={autoMarkTeacherAbsent} onChange={e => setAutoMarkTeacherAbsent(e.target.value)} className="px-4 py-2.5 border rounded-lg font-bold outline-none bg-teal-50 text-teal-700" />
            </div>
          </div>
          <ToggleRow label="Send Mark Absent App Notification to parents/students." checked={sendMarkAbsent} onChange={setSendMarkAbsent} />
        </fieldset>

        {/* Auto App Notification */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-3">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Auto App Notification</legend>
          <ToggleRow label="Send Absent Attendance notification to student/parents/staff app." checked={sendAbsentNotif} onChange={setSendAbsentNotif} />
          <ToggleRow label="Send Present Attendance notification to student/students App." checked={sendPresentNotif} onChange={setSendPresentNotif} />
          <ToggleRow label="Send Present Attendance notification to staff." checked={sendPresentStaffNotif} onChange={setSendPresentStaffNotif} />
        </fieldset>

        {/* Home Work Notification */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-3">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Home Work Notification</legend>
          <ToggleRow label="Send homework notification to parents/students." checked={sendHomeworkParents} onChange={setSendHomeworkParents} />
          <ToggleRow label="Send homework submission notification to teachers." checked={sendHomeworkTeachers} onChange={setSendHomeworkTeachers} />
          <ToggleRow label="Send homework check/review notification to parents/students." checked={sendHomeworkCheck} onChange={setSendHomeworkCheck} />
        </fieldset>

        {/* Defaulter Notification */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-3">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Defaulter Notification</legend>
          <ToggleRow label="Send defaulter notification to parents/students." checked={sendDefaulter} onChange={setSendDefaulter} />
        </fieldset>

        {/* Birthday Notification */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-3">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Birthday Notification</legend>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-[10px] text-yellow-700 font-bold leading-relaxed">
            Note: In case you are using a paid notification provider instead of default, birthday messages will be charged at a flat fee. Actual fee may vary as it depends on the provider.
          </div>
          <ToggleRow label="Send Birthday APP Notification to students." checked={sendBirthdayStudents} onChange={setSendBirthdayStudents} />
          <ToggleRow label="Send Birthday APP Notification to staff/s." checked={sendBirthdayStaff} onChange={setSendBirthdayStaff} />
          <ToggleRow label="Preferred time to send birthday App notification." checked={preferredBirthdayTime} onChange={setPreferredBirthdayTime} />
          {preferredBirthdayTime && (
            <div className="px-5 py-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-3">
              <p className="text-[10px] font-bold text-slate-400">Time</p>
              <input type="time" defaultValue="04:00" className="px-3 py-1.5 border rounded-lg text-[10px] font-bold outline-none" />
            </div>
          )}
        </fieldset>

      </div>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">App notification settings saved!</span>
        </div>
      )}

    </div>
  )
}

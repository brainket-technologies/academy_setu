'use client'

import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface ToggleRowProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  templateText?: string
}

function ToggleRow({ label, checked, onChange, templateText }: ToggleRowProps) {
  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between px-5 py-3.5 border border-slate-200 rounded-xl bg-white">
        <span className="text-xs font-bold text-slate-700">{label}</span>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-teal-500' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${checked ? 'left-5.5' : 'left-0.5'}`} style={{ left: checked ? '22px' : '2px' }} />
        </button>
      </div>
      {checked && templateText && (
        <div className="px-5 py-2 border border-t-0 border-slate-200 rounded-b-xl bg-slate-50 -mt-1">
          <p className="text-[10px] font-bold text-slate-400 mb-1">Select Template</p>
          <p className="text-[10px] text-slate-500 leading-relaxed">{templateText}</p>
        </div>
      )}
    </div>
  )
}

export default function MessageServiceSmsPage() {
  const [punchInTime, setPunchInTime] = useState('05:00 am')
  const [punchOutTime, setPunchOutTime] = useState('00:00 PM')
  const [missPunchOutTime, setMissPunchOutTime] = useState('06:00 AM')

  // Timing toggles
  const [sendPunchIn, setSendPunchIn] = useState(false)
  const [sendPunchOut, setSendPunchOut] = useState(false)

  // Present Attendance
  const [sendPresentParents, setSendPresentParents] = useState(false)
  const [sendPresentStaff, setSendPresentStaff] = useState(false)

  // Absent Attendance
  const [sendAbsent, setSendAbsent] = useState(false)
  const [sendPostAbsent, setSendPostAbsent] = useState(false)
  const [sendAbsentStaff, setSendAbsentStaff] = useState(false)
  const [sendPostAbsentStaff, setSendPostAbsentStaff] = useState(false)

  // Admission / Account Creation
  const [sendAdmission, setSendAdmission] = useState(false)

  // Birthday
  const [sendBirthdayStudents, setSendBirthdayStudents] = useState(false)
  const [sendBirthdayStaff, setSendBirthdayStaff] = useState(false)
  const [preferredBirthdayTime, setPreferredBirthdayTime] = useState(false)

  const tpl = 'Dear parents, [APP_NAME] is pleased to let [Date_Time], [School_Name] for more details install our app : https://www.academysetu.com [logo]'

  const [toastOpen, setToastOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">SMS</h1>
        <p className="text-xs text-slate-400">Configure SMS notification triggers and templates</p>
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
              <p className="text-[9px] text-slate-400">If an student hasn&apos;t punched out by this time, auto-send SMS.</p>
              <input type="text" value={missPunchOutTime} onChange={e => setMissPunchOutTime(e.target.value)} className="px-4 py-2.5 border rounded-lg font-bold outline-none w-40 bg-slate-800 text-white" />
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <ToggleRow label="Send Punched In SMS to parents/students." checked={sendPunchIn} onChange={setSendPunchIn} templateText={sendPunchIn ? tpl : undefined} />
            <ToggleRow label="Send Punched Out SMS to parents/students." checked={sendPunchOut} onChange={setSendPunchOut} templateText={sendPunchOut ? tpl : undefined} />
          </div>
        </fieldset>

        {/* Present Attendance */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-3">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Present Attendance</legend>
          <ToggleRow label="Send Present Attendance SMS to parents/students." checked={sendPresentParents} onChange={setSendPresentParents} templateText={sendPresentParents ? tpl : undefined} />
          <ToggleRow label="Send Present Attendance SMS to Staff." checked={sendPresentStaff} onChange={setSendPresentStaff} templateText={sendPresentStaff ? tpl : undefined} />
        </fieldset>

        {/* Absent Attendance */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-3">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Absent Attendance</legend>
          <ToggleRow label="Send Absent Attendance SMS to parents/students." checked={sendAbsent} onChange={setSendAbsent} templateText={sendAbsent ? tpl : undefined} />
          <ToggleRow label="Send Post Absent Attendance SMS to parents/students." checked={sendPostAbsent} onChange={setSendPostAbsent} templateText={sendPostAbsent ? tpl : undefined} />
          <ToggleRow label="Send Absent Attendance SMS to Staff (Teachers & Employees)." checked={sendAbsentStaff} onChange={setSendAbsentStaff} templateText={sendAbsentStaff ? tpl : undefined} />
          <ToggleRow label="Send Post Absent Attendance SMS to Staff (Teachers & Employees)." checked={sendPostAbsentStaff} onChange={setSendPostAbsentStaff} templateText={sendPostAbsentStaff ? tpl : undefined} />
        </fieldset>

        {/* Admission / Account Creation */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-3">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Admission / Account Creation</legend>
          <ToggleRow label="Send Admission/Account Creation SMS to students/parents?" checked={sendAdmission} onChange={setSendAdmission} templateText={sendAdmission ? tpl : undefined} />
        </fieldset>

        {/* Birthday */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-3">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Birthday</legend>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-[10px] text-yellow-700 font-bold leading-relaxed">
            Note: In case you are using a paid SMS provider instead of our default SMS provider, birthday messages will be charged at a flat fee. The actual fee may vary as it depends on provider.
          </div>
          <ToggleRow label="Send Birthday SMS to Students." checked={sendBirthdayStudents} onChange={setSendBirthdayStudents} />
          {sendBirthdayStudents && (
            <div className="px-5 py-3 border border-slate-200 rounded-xl bg-slate-50">
              <p className="text-[10px] font-bold text-slate-400 mb-1">Select Student Birthday SMS Template</p>
              <p className="text-[10px] text-slate-500">Dear [I_DOB_NAME] We wish you a Happy Birthday</p>
            </div>
          )}
          <ToggleRow label="Send Birthday SMS to Staff." checked={sendBirthdayStaff} onChange={setSendBirthdayStaff} />
          {sendBirthdayStaff && (
            <div className="px-5 py-3 border border-slate-200 rounded-xl bg-slate-50">
              <p className="text-[10px] font-bold text-slate-400 mb-1">Select Staff Birthday SMS Template</p>
              <p className="text-[10px] text-slate-500">Dear [I_DOB_NAME] We wish you a Happy Birthday</p>
            </div>
          )}
          <ToggleRow label="Preferred time to send birthday sms." checked={preferredBirthdayTime} onChange={setPreferredBirthdayTime} />
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
          <span className="text-xs font-bold">SMS settings saved!</span>
        </div>
      )}

    </div>
  )
}

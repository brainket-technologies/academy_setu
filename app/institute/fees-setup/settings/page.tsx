'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Save } from 'lucide-react'
import { toast } from 'sonner'

export interface GlobalFeeSettings {
  globalFeeDueDay: string
  reminderDaysBefore: string
  secondReminderDaysAfter: string
}

const DEFAULT_GLOBAL_SETTINGS: GlobalFeeSettings = {
  globalFeeDueDay: '10',
  reminderDaysBefore: '3',
  secondReminderDaysAfter: '2'
}

export default function FeeSettingsPage() {
  const [globalSettings, setGlobalSettings] = useState<GlobalFeeSettings>(DEFAULT_GLOBAL_SETTINGS)

  useEffect(() => {
    // Load Global Settings
    const savedGlobal = localStorage.getItem('school_global_fee_settings')
    if (savedGlobal) {
      try {
        const parsed = JSON.parse(savedGlobal)
        setGlobalSettings({
          globalFeeDueDay: parsed.globalFeeDueDay ?? '10',
          reminderDaysBefore: parsed.reminderDaysBefore ?? '3',
          secondReminderDaysAfter: parsed.secondReminderDaysAfter ?? '2'
        })
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_global_fee_settings', JSON.stringify(DEFAULT_GLOBAL_SETTINGS))
    }
  }, [])

  const handleSaveGlobalSettings = (e: React.FormEvent) => {
    e.preventDefault()
    const savedGlobal = localStorage.getItem('school_global_fee_settings')
    const existing = savedGlobal ? JSON.parse(savedGlobal) : {}
    const updated = {
      ...existing,
      ...globalSettings
    }
    localStorage.setItem('school_global_fee_settings', JSON.stringify(updated))
    toast.success('Global fee settings saved successfully!')
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Fee Settings</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Configure global fee due days and reminder schedules for the institute.</p>
        </div>
        <button
          onClick={handleSaveGlobalSettings}
          className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {/* Global Fee Settings Form Controls */}
      <form onSubmit={handleSaveGlobalSettings} className="flex flex-col gap-6">

        {/* Global Schedule Controls */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3 mb-6">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              GLOBAL FEE DUE & REMINDER SCHEDULE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Global Fee Due Day of Month <span className="text-red-500">*</span>
              </label>
              <select
                value={globalSettings.globalFeeDueDay}
                onChange={e => setGlobalSettings({ ...globalSettings, globalFeeDueDay: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={String(day)}>
                    {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of every month
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 font-medium">Standard monthly fee due date for all classes</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                First Fee Reminder Day <span className="text-red-500">*</span>
              </label>
              <select
                value={globalSettings.reminderDaysBefore}
                onChange={e => setGlobalSettings({ ...globalSettings, reminderDaysBefore: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="1">1 Day Before Due Date</option>
                <option value="2">2 Days Before Due Date</option>
                <option value="3">3 Days Before Due Date</option>
                <option value="5">5 Days Before Due Date</option>
                <option value="7">7 Days Before Due Date</option>
                <option value="0">On Due Date</option>
              </select>
              <span className="text-[10px] text-slate-400 font-medium">Sends automated advance reminder to parents</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Second (Overdue) Reminder Day <span className="text-red-500">*</span>
              </label>
              <select
                value={globalSettings.secondReminderDaysAfter}
                onChange={e => setGlobalSettings({ ...globalSettings, secondReminderDaysAfter: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="1">1 Day After Due Date</option>
                <option value="2">2 Days After Due Date</option>
                <option value="3">3 Days After Due Date</option>
                <option value="5">5 Days After Due Date</option>
                <option value="7">7 Days After Due Date</option>
              </select>
              <span className="text-[10px] text-slate-400 font-medium">Sends follow-up notice for overdue fees</span>
            </div>

          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-lg transition-colors text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Global Fee Settings</span>
          </button>
        </div>

      </form>

    </div>
  )
}


'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Eye, ShoppingCart, X, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface SmsRecord {
  id: number
  smsType: string
  template: string
  status: 'Delivered' | 'Failed'
  sentDate: string
}

const INITIAL_SMS: SmsRecord[] = [
  {
    id: 1,
    smsType: 'Lorem ipsum dolor sit amet',
    template: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
    status: 'Delivered',
    sentDate: '15/09/2025 11:00 AM',
  },
  {
    id: 2,
    smsType: 'Lorem ipsum dolor sit amet',
    template: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
    status: 'Failed',
    sentDate: '15/09/2025 11:00 AM',
  },
  {
    id: 3,
    smsType: 'Lorem ipsum dolor sit amet',
    template: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
    status: 'Delivered',
    sentDate: '15/09/2025 11:00 AM',
  },
]

export default function TextSmsPage() {
  const [smsList, setSmsList] = useState<SmsRecord[]>(INITIAL_SMS)
  const [searchQuery, setSearchQuery] = useState('')

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSms, setSelectedSms] = useState<SmsRecord | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('school_sms')
    if (saved) {
      try { setSmsList(JSON.parse(saved)) } catch (e) { console.error(e) }
    } else {
      localStorage.setItem('school_sms', JSON.stringify(INITIAL_SMS))
    }
  }, [])

  const filtered = smsList.filter(s =>
    s.smsType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.template.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Text SMS</h1>
          <p className="text-xs text-slate-400">Manage SMS templates and delivery logs</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/institute/sms/orders"
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-colors"
          >
            Order SMS
          </Link>
          <Link
            href="/institute/sms/new-template"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Template
          </Link>
          <button
            onClick={() => alert('Redirecting to SMS purchase portal...')}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Buy SMS
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search by Name, Mobile no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>
      </div>

      {/* SMS table (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">SMS Type</th>
                <th className="px-4 py-4 text-left">Template</th>
                <th className="px-4 py-4 w-28">Status</th>
                <th className="px-4 py-4 w-44">Sent Date</th>
                <th className="px-4 py-4 w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold align-top">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-800">{item.smsType}</td>
                  <td className="px-4 py-3.5 text-left text-slate-500 leading-relaxed max-w-sm">{item.template}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      item.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      ● {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <span>📅</span>
                      <span>{item.sentDate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => { setSelectedSms(item); setDetailOpen(true) }}
                      className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 mx-auto transition-colors"
                      title="View Message"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">No SMS logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Message Detail Modal (Screenshot 2) ===== */}
      {detailOpen && selectedSms && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 relative p-8 space-y-6">

            <button
              onClick={() => setDetailOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-3 uppercase tracking-wider">Message</h2>

            <div className="grid grid-cols-2 gap-6 text-xs font-semibold text-slate-700">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold text-[10px] uppercase">Sms Type</label>
                <div className="px-4 py-2.5 bg-teal-600 text-white rounded-lg font-bold">Lorem Ipsum</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold text-[10px] uppercase">Status</label>
                <div className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold">{selectedSms.status}</div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
              <label className="text-slate-400 font-bold text-[10px] uppercase">Message</label>
              <div className="px-4 py-4 bg-sky-50 border border-sky-100 rounded-xl text-slate-600 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

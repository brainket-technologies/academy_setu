'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Eye, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface CustomFormRecord {
  id: number
  title: string
  totalLeads: number
  linkToLead: 'Linked' | '—'
  receiverEmail: string
  session: string
  status: 'Active' | 'Inactive'
  createdAt: string
  description?: string
}

const INITIAL_FORMS: CustomFormRecord[] = [
  { id: 1, title: 'Custom Form 1', totalLeads: 2, linkToLead: 'Linked', receiverEmail: 'abcd@gmail.com', session: '2025-26', status: 'Active', createdAt: '15/09/2025\n11:00 AM', description: 'Admission inquiry form.' },
  { id: 2, title: 'Custom Form 2', totalLeads: 0, linkToLead: '—', receiverEmail: 'abcd@gmail.com', session: '2024-25', status: 'Inactive', createdAt: '15/09/2025\n11:00 AM', description: 'Parent survey form.' },
  { id: 3, title: 'Custom Form 3', totalLeads: 1, linkToLead: 'Linked', receiverEmail: 'abcd@gmail.com', session: '2023-24', status: 'Active', createdAt: '15/09/2025\n11:00 AM', description: 'Feedback evaluation form.' },
]

export default function AllCustomFormsPage() {
  const [forms, setForms] = useState<CustomFormRecord[]>(INITIAL_FORMS)
  const [searchQuery, setSearchQuery] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_custom_forms')
    if (saved) {
      try {
        setForms(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_custom_forms', JSON.stringify(INITIAL_FORMS))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Delete this custom form?')) {
      const updated = forms.filter(f => f.id !== id)
      setForms(updated)
      localStorage.setItem('school_custom_forms', JSON.stringify(updated))
      showToast('Form deleted successfully!')
    }
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const filtered = forms.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.receiverEmail.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">Custom Forms</h1>
          <p className="text-xs text-slate-400">View and manage dynamic frontend registration forms</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-56 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search by Name, Mobile no..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
            />
          </div>
          <Link
            href="/institute/custom-forms/create"
            className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Listing Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4 text-left">Title</th>
                <th className="px-3 py-4 w-28">Total Leads</th>
                <th className="px-3 py-4">Link to Lead</th>
                <th className="px-3 py-4">Receiver Email</th>
                <th className="px-3 py-4">Session</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4 w-36">Created At</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-850 max-w-[200px] truncate">{item.title}</td>
                  <td className="px-3 py-3.5">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-250">
                      {item.totalLeads}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-slate-600">{item.linkToLead}</td>
                  <td className="px-3 py-3.5 text-slate-600 font-bold">{item.receiverEmail}</td>
                  <td className="px-3 py-3.5 text-slate-650">{item.session}</td>
                  <td className="px-3 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      • {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-slate-450 whitespace-pre-line leading-tight text-[10px]">
                    {item.createdAt}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100">
                        <Eye className="w-3 h-3" />
                      </button>
                      <button className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">
                    No custom forms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-slate-400 font-semibold">
          <p>Showing 1-{filtered.length} of {filtered.length} Entries</p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">«</button>
            <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">‹</button>
            <button className="w-7 h-7 rounded bg-teal-600 text-white flex items-center justify-center font-bold">1</button>
            <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-550 hover:bg-slate-50">2</button>
            <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">›</button>
            <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">»</button>
          </div>
        </div>
      </div>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

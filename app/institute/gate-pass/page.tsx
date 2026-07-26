'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, UserCheck, Printer, Download, Pencil, Trash2, MoreVertical, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface GatePassRecord {
  id: number
  userType: 'Student' | 'Staff' | 'Visitor'
  userName: string
  idNo: string
  receiverName: string
  receiverDetail: string
  reason: string
  entryGate: string
  exitGate: string
  createdAt: string
  passType: 'one-time' | 'permanent'
}

const INITIAL_PASSES: GatePassRecord[] = [
]

export default function AllGatePassPage() {
  const [passes, setPasses] = useState<GatePassRecord[]>(INITIAL_PASSES)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'one-time' | 'permanent'>('one-time')
  const [filterAll, setFilterAll] = useState('')
  const [actionMenuId, setActionMenuId] = useState<number | null>(null)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_gate_passes')
    if (saved) {
      try { setPasses(JSON.parse(saved)) } catch (e) { console.error(e) }
    } else {
      localStorage.setItem('school_gate_passes', JSON.stringify(INITIAL_PASSES))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Delete this gate pass?')) {
      const updated = passes.filter(p => p.id !== id)
      setPasses(updated)
      localStorage.setItem('school_gate_passes', JSON.stringify(updated))
      setActionMenuId(null)
      setToastMsg('Gate pass deleted!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const oneTimeCount = passes.filter(p => p.passType === 'one-time').length
  const permanentCount = passes.filter(p => p.passType === 'permanent').length

  const filtered = passes
    .filter(p => p.passType === activeTab)
    .filter(p =>
      p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receiverName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(p => !filterAll || p.userType === filterAll)

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">Gate Pass</h1>
          <p className="text-xs text-slate-400">Manage visitor and student gate passes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-56 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input type="text" placeholder="Search by Name, Mobile no..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold" />
          </div>
          <Link href="/institute/gate-pass/permanent-registration" className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors">
            <UserCheck className="w-3.5 h-3.5" /> Permanent Registration
          </Link>
          <Link href="/institute/gate-pass/visitor-entry" className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors">
            <Plus className="w-3.5 h-3.5" /> Visitor Entry
          </Link>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('one-time')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'one-time' ? 'bg-teal-600 text-white font-extrabold' : 'bg-white border text-slate-650 hover:bg-slate-50'}`}>
            One Time Visitor <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'one-time' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-600'}`}>{String(oneTimeCount).padStart(2, '0')}</span>
          </button>
          <button onClick={() => setActiveTab('permanent')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'permanent' ? 'bg-teal-600 text-white font-extrabold' : 'bg-white border text-slate-650 hover:bg-slate-50'}`}>
            Permanent Visitor <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'permanent' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-600'}`}>{String(permanentCount).padStart(2, '0')}</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" className="px-3 py-2 border rounded-lg text-xs font-bold outline-none" />
          <input type="date" className="px-3 py-2 border rounded-lg text-xs font-bold outline-none" />
          <select value={filterAll} onChange={e => setFilterAll(e.target.value)} className="px-3 py-2 border rounded-lg text-xs font-bold outline-none bg-white min-w-[80px]">
            <option value="">All</option>
            <option value="Student">Student</option>
            <option value="Staff">Staff</option>
            <option value="Visitor">Visitor</option>
          </select>
        </div>
      </div>

      {/* Gate Pass Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-12">S. No.</th>
                <th className="px-3 py-4">User Type</th>
                <th className="px-3 py-4 text-left">User Name</th>
                <th className="px-3 py-4">ID No.</th>
                <th className="px-3 py-4 w-12">Photo</th>
                <th className="px-3 py-4 text-left">Receiver Name</th>
                <th className="px-3 py-4 text-left">Receiver Detail</th>
                <th className="px-3 py-4 text-left">Reason</th>
                <th className="px-3 py-4">Entry Gate</th>
                <th className="px-3 py-4">Exit Gate</th>
                <th className="px-3 py-4 w-36">Created At</th>
                <th className="px-3 py-4 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold align-top relative">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.userType}</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-800">{item.userName}</td>
                  <td className="px-3 py-3.5 text-slate-500">{item.idNo}</td>
                  <td className="px-3 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 mx-auto" />
                  </td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-800">{item.receiverName}</td>
                  <td className="px-3 py-3.5 text-left text-slate-500 whitespace-pre-line text-[10px] leading-relaxed">{item.receiverDetail}</td>
                  <td className="px-3 py-3.5 text-left text-slate-500">{item.reason}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.entryGate}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.exitGate || '—'}</td>
                  <td className="px-3 py-3.5 text-slate-450 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1"><span>📅</span><span>{item.createdAt}</span></div>
                  </td>
                  <td className="px-3 py-3.5 relative">
                    <button onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 mx-auto transition-colors">
                      <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    {actionMenuId === item.id && (
                      <div className="absolute right-4 top-10 bg-white border rounded-xl shadow-xl z-20 py-1.5 w-32 animate-in fade-in zoom-in-95 duration-150">
                        <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 text-xs font-bold text-slate-600"><Printer className="w-3.5 h-3.5 text-blue-500" /> Print</button>
                        <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 text-xs font-bold text-slate-600"><Download className="w-3.5 h-3.5 text-amber-500" /> Download</button>
                        <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 text-xs font-bold text-slate-600"><Pencil className="w-3.5 h-3.5 text-emerald-500" /> Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-50 text-xs font-bold text-red-500"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={12} className="py-8 text-center text-slate-400 font-bold">No gate passes found.</td></tr>
              )}
            </tbody>
          </table>
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

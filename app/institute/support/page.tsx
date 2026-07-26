'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Eye, Trash2, X, CheckCircle2, AlertCircle, Upload } from 'lucide-react'
import Link from 'next/link'

interface TicketRecord {
  id: number
  ticketId: string
  priority: 'Low' | 'Medium' | 'High'
  type: string
  title: string
  replies: string
  status: 'Active' | 'Inactive'
  createdAt: string
  description?: string
  category?: string
  subCategory?: string
}

const INITIAL_TICKETS: TicketRecord[] = [
]

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<TicketRecord[]>(INITIAL_TICKETS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('')
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null)

  // Create Form State
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low')
  const [ticketType, setTicketType] = useState('')
  const [issueBrief, setIssueBrief] = useState('')
  const [attachedFiles, setAttachedFiles] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_support_tickets')
    if (saved) {
      try {
        setTickets(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_support_tickets', JSON.stringify(INITIAL_TICKETS))
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this support ticket?')) {
      const updated = tickets.filter(t => t.id !== id)
      setTickets(updated)
      localStorage.setItem('school_support_tickets', JSON.stringify(updated))
      showToast('Ticket deleted successfully!')
    }
  }

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !subCategory || !ticketType || !issueBrief) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const newTicket: TicketRecord = {
      id: Date.now(),
      ticketId: 'Tick' + Math.floor(100 + Math.random() * 900),
      priority,
      type: ticketType,
      title: issueBrief.slice(0, 15) + (issueBrief.length > 15 ? '...' : ''),
      replies: '—',
      status: 'Active',
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      description: issueBrief,
      category,
      subCategory
    }

    const updated = [newTicket, ...tickets]
    setTickets(updated)
    localStorage.setItem('school_support_tickets', JSON.stringify(updated))

    // Reset Form
    setCategory('')
    setSubCategory('')
    setPriority('Low')
    setTicketType('')
    setIssueBrief('')
    setAttachedFiles('')
    setCreateModalOpen(false)
    showToast('Support ticket created successfully!')
  }

  const filtered = tickets.filter(t => {
    if (searchQuery && !t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) && !t.type.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (selectedTypeFilter && t.type !== selectedTypeFilter) return false
    if (selectedPriorityFilter && t.priority !== selectedPriorityFilter) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">Support Tickets</h1>
          <p className="text-xs text-slate-400">Request support or file complaints</p>
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
        </div>
      </div>

      {/* Filters & Add Trigger bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 bg-white border rounded-2xl p-6 shadow-sm text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <label className="text-slate-550 font-bold">Type</label>
            <select
              value={selectedTypeFilter}
              onChange={e => setSelectedTypeFilter(e.target.value)}
              className="px-3 py-2.5 border rounded-lg bg-white outline-none font-bold"
            >
              <option value="">Select Option</option>
              <option value="Sales">Sales</option>
              <option value="Feedback">Feedback</option>
              <option value="Technical Support">Technical Support</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <label className="text-slate-550 font-bold">Priority</label>
            <select
              value={selectedPriorityFilter}
              onChange={e => setSelectedPriorityFilter(e.target.value)}
              className="px-3 py-2.5 border rounded-lg bg-white outline-none font-bold"
            >
              <option value="">Select Option</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-6 py-2.5 bg-teal-650 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Ticket
        </button>
      </div>

      {/* Listing Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4">Ticket ID</th>
                <th className="px-3 py-4">Priority</th>
                <th className="px-3 py-4">Type</th>
                <th className="px-3 py-4 text-left">Title</th>
                <th className="px-3 py-4">Replies</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4 w-36">Created At</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 font-bold text-slate-800">{item.ticketId}</td>
                  <td className="px-3 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.priority === 'High' ? 'bg-red-50 text-red-650' : item.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-550'}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-slate-600">{item.type}</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-850 max-w-[140px] truncate">{item.title}</td>
                  <td className="px-3 py-3.5 text-slate-450">{item.replies}</td>
                  <td className="px-3 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-100' : 'bg-red-50 text-red-550 border border-red-100'}`}>
                      • {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-slate-450 whitespace-pre-line leading-tight text-[10px]">
                    {item.createdAt}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(item)}
                        className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-550 flex items-center justify-center hover:bg-red-100 border border-red-100"
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
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== CREATE TICKET POPUP MODAL ===== */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setCreateModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Create Ticket</h3>
              <button onClick={() => setCreateModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Category <span className="text-red-500">*</span></label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="px-3 py-2.5 border rounded-lg bg-white outline-none"
                  >
                    <option value="">Select Category</option>
                    <option value="Admin">Admin</option>
                    <option value="Finance">Finance</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Sub Category <span className="text-red-500">*</span></label>
                  <select
                    value={subCategory}
                    onChange={e => setSubCategory(e.target.value)}
                    className="px-3 py-2.5 border rounded-lg bg-white outline-none"
                  >
                    <option value="">Select Sub Category</option>
                    <option value="Login Issue">Login Issue</option>
                    <option value="Fee Receipt Error">Fee Receipt Error</option>
                    <option value="Feedback submission">Feedback submission</option>
                  </select>
                </div>
              </div>

              {/* Priority radios */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Priority <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-6">
                  {['Low', 'Medium', 'High'].map(p => (
                    <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        checked={priority === p}
                        onChange={() => setPriority(p as any)}
                        className="accent-teal-605 w-3.5 h-3.5"
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 p-2 bg-red-50 text-red-650 rounded border border-red-100 text-[10px] mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Your Problem solve within 24 hours.</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Type <span className="text-red-500">*</span></label>
                <select
                  value={ticketType}
                  onChange={e => setTicketType(e.target.value)}
                  className="px-3 py-2.5 border rounded-lg bg-white outline-none"
                >
                  <option value="">Select an option</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Sales">Sales</option>
                  <option value="Technical Support">Technical Support</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Please write the issue in brief</label>
                <textarea
                  placeholder="Enter Issue in brief"
                  value={issueBrief}
                  onChange={e => setIssueBrief(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none h-24 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Files <span className="text-slate-400 font-normal text-[10px]">(You can upload max 5 files including jpeg, jpg, png, webp, mp4 or pdf, max size must be 50MB.)</span></label>
                <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Attach File"
                    value={attachedFiles}
                    onChange={e => setAttachedFiles(e.target.value)}
                    className="flex-1 px-4 py-2.5 outline-none bg-transparent font-semibold"
                  />
                  <div className="p-2.5 border-l bg-slate-100 text-teal-650 cursor-pointer" onClick={() => setAttachedFiles('log_screenshot.png')}>
                    <Upload className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md text-xs"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DETAIL PREVIEW MODAL ===== */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Ticket Details: {selectedTicket.ticketId}</h3>
              <button onClick={() => setSelectedTicket(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <p>Type: <span className="font-bold text-slate-800">{selectedTicket.type}</span></p>
              <p>Priority: <span className="font-bold text-slate-800">{selectedTicket.priority}</span></p>
              <p>Status: <span className="font-bold text-slate-800">{selectedTicket.status}</span></p>
              <p>Created At: <span className="font-bold text-slate-800">{selectedTicket.createdAt}</span></p>
            </div>
            <div className="border-t pt-3">
              <p className="font-bold text-slate-850 mb-1">Issue Description:</p>
              <p className="text-slate-650 leading-relaxed text-[11px] bg-slate-50 p-3 rounded-lg border">{selectedTicket.description || 'No detailed description.'}</p>
            </div>
          </div>
        </div>
      )}

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, X, CheckCircle2 } from 'lucide-react'

interface LeaveTypeRecord {
  id: number
  applyTo: string
  leaveType: string
  leaveAbbr: string
  markAs: 'Present' | 'Absent' | 'Leave'
}

const INITIAL_TYPES: LeaveTypeRecord[] = [
]

export default function LeaveTypesPage() {
  const [types, setTypes] = useState<LeaveTypeRecord[]>(INITIAL_TYPES)
  const [searchQuery, setSearchQuery] = useState('')

  // Create / Edit modal state (Screenshot 2)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  const [applyTo, setApplyTo] = useState('Staff') // Student, Staff, Leave/Holiday
  const [leaveType, setLeaveType] = useState('')
  const [leaveAbbr, setLeaveAbbr] = useState('')
  const [markAs, setMarkAs] = useState<'Present' | 'Absent' | 'Leave'>('Present') // Present, Absent, Leave

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('leave_types')
    if (saved) {
      try {
        setTypes(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('leave_types', JSON.stringify(INITIAL_TYPES))
    }
  }, [])

  const handleOpenAdd = () => {
    setEditId(null)
    setApplyTo('Staff')
    setLeaveType('')
    setLeaveAbbr('')
    setMarkAs('Present')
    setModalOpen(true)
  }

  const handleOpenEdit = (t: LeaveTypeRecord) => {
    setEditId(t.id)
    setApplyTo(t.applyTo)
    setLeaveType(t.leaveType)
    setLeaveAbbr(t.leaveAbbr)
    setMarkAs(t.markAs)
    setModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!leaveType.trim() || !leaveAbbr.trim()) {
      alert('Please fill in Leave Type and Abbreviation.')
      return
    }

    const payload: LeaveTypeRecord = {
      id: editId || Date.now(),
      applyTo,
      leaveType,
      leaveAbbr,
      markAs
    }

    let updated: LeaveTypeRecord[] = []
    if (editId) {
      updated = types.map(item => item.id === editId ? payload : item)
      setToastMsg('Leave type details updated successfully!')
    } else {
      updated = [...types, payload]
      setToastMsg('Leave type added successfully!')
    }

    setTypes(updated)
    localStorage.setItem('leave_types', JSON.stringify(updated))
    setModalOpen(false)
    
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this leave type option?')) {
      const updated = types.filter(t => t.id !== id)
      setTypes(updated)
      localStorage.setItem('leave_types', JSON.stringify(updated))
      setToastMsg('Leave type option deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const filtered = types.filter(t => 
    t.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.applyTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.leaveAbbr.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Leave Type</h1>
          <p className="text-xs text-slate-400">Establish categorizations and rules for leave allowances</p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

        {/* Plus Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Leave Type
          </button>
        </div>

      </div>

      {/* Table grid listing (Screenshot 3) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
          
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4">Apply to</th>
                <th className="px-4 py-4 text-left">Leave Type</th>
                <th className="px-4 py-4">Leave Abbr.</th>
                <th className="px-4 py-4">Mark as</th>
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-350">{item.applyTo}</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-850 dark:text-slate-200">{item.leaveType}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{item.leaveAbbr}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.markAs === 'Present' ? 'bg-emerald-50 text-emerald-600' :
                      item.markAs === 'Absent' ? 'bg-red-50 text-red-500' :
                      'bg-sky-50 text-sky-655 text-sky-600'
                    }`}>
                      {item.markAs}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                        title="Edit Details"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete Leave Type"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">No leave types registered.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

      </div>

      {/* ================================== SETUP MODAL FORM (Screenshot 2) ================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black text-[#1b3a60] dark:text-slate-350 uppercase tracking-wider">
                Create Leave Type
              </span>
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-700">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Leave Type</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Casual Leave"
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Leave Abbreviation</label>
                  <input 
                    type="text" 
                    placeholder="Ex: CL"
                    value={leaveAbbr}
                    onChange={e => setLeaveAbbr(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Apply To Radios (Screenshot 2) */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-700">Apply to</span>
                <div className="flex gap-6 items-center pt-1 font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="applyTo" checked={applyTo === 'Student'} onChange={() => setApplyTo('Student')} />
                    Student
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="applyTo" checked={applyTo === 'Staff'} onChange={() => setApplyTo('Staff')} />
                    Staff
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="applyTo" checked={applyTo === 'Leave/Holiday'} onChange={() => setApplyTo('Leave/Holiday')} />
                    Leave/Holiday
                  </label>
                </div>
              </div>

              {/* Approved As Radios (Screenshot 2) */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-700">Approved as</span>
                <div className="flex gap-6 items-center pt-1 font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="markAs" checked={markAs === 'Present'} onChange={() => setMarkAs('Present')} />
                    Present
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="markAs" checked={markAs === 'Absent'} onChange={() => setMarkAs('Absent')} />
                    Absent
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="markAs" checked={markAs === 'Leave'} onChange={() => setMarkAs('Leave')} />
                    Leave
                  </label>
                </div>
              </div>

            </div>

            <div className="flex justify-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100">
              <button 
                type="submit"
                className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-md"
              >
                Save
              </button>
            </div>
          </form>
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

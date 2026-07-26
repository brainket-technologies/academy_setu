'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Filter, MoreVertical, Eye, CheckCircle2, XCircle, Trash2, X, Sparkles } from 'lucide-react'

interface LeaveRequestRecord {
  id: number
  name: string
  userType: string
  applyDate: string
  leaveType: string
  dateRange: string
  duration: number
  status: 'Approved' | 'Pending' | 'Reject'
}

const INITIAL_REQUESTS: LeaveRequestRecord[] = [
]

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequestRecord[]>(INITIAL_REQUESTS)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Context Menu Dropdown Target ID
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestRecord | null>(null)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('leave_requests')
    if (saved) {
      try {
        setRequests(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('leave_requests', JSON.stringify(INITIAL_REQUESTS))
    }
  }, [])

  const handleUpdateStatus = (id: number, status: 'Approved' | 'Reject') => {
    const updated = requests.map(r => r.id === id ? { ...r, status } : r)
    setRequests(updated)
    localStorage.setItem('leave_requests', JSON.stringify(updated))
    setActiveMenuId(null)
    
    setToastMsg(`Leave request status updated to ${status}!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this leave request record?')) {
      const updated = requests.filter(r => r.id !== id)
      setRequests(updated)
      localStorage.setItem('leave_requests', JSON.stringify(updated))
      setActiveMenuId(null)
      
      setToastMsg('Leave request deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const filtered = requests.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.userType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Leave Request</h1>
          <p className="text-xs text-slate-400">Track and moderate student and staff leave submissions</p>
        </div>
      </div>

      {/* Control Actions / Search and Export Card */}
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

        {/* Action filter button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            type="button"
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-teal-650 hover:bg-slate-50 bg-white"
            title="Filters"
          >
            <Filter className="w-4 h-4 text-teal-600" />
          </button>
        </div>

      </div>

      {/* Table grid listing (Screenshot 4) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-visible">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 overflow-visible">
          
          <table className="w-full text-xs text-center border-collapse overflow-visible">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Name</th>
                <th className="px-4 py-4">User Type</th>
                <th className="px-4 py-4">Apply Date</th>
                <th className="px-4 py-4 text-left">Leave Type</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Duration</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold overflow-visible">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-extrabold text-slate-850 dark:text-slate-200">{item.name}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-350">{item.userType}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-semibold">{item.applyDate}</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-800 dark:text-slate-200">{item.leaveType}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-semibold">{item.dateRange}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">{item.duration}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                      item.status === 'Reject' ? 'bg-red-50 text-red-500' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 relative overflow-visible">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Context Action Menu Dropdown (Screenshot 1) */}
                    {activeMenuId === item.id && (
                      <div className="absolute right-8 top-2 z-30 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-2xl py-2 w-32 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 text-left font-bold select-none">
                        <button 
                          onClick={() => {
                            setSelectedRequest(item)
                            setActiveMenuId(null)
                          }}
                          className="w-full px-4 py-2 hover:bg-sky-50 dark:hover:bg-slate-750 text-sky-600 flex items-center gap-2 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(item.id, 'Approved')}
                          className="w-full px-4 py-2 hover:bg-emerald-50 dark:hover:bg-slate-750 text-emerald-600 flex items-center gap-2 text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(item.id, 'Reject')}
                          className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-500 flex items-center gap-2 text-xs"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <div className="border-t border-slate-100 my-1"></div>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-full px-4 py-2 hover:bg-red-50 dark:hover:bg-slate-750 text-red-500 flex items-center gap-2 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">No leave requests found.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-{filtered.length} of 456 Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-teal-655">2</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">»</button>
          </div>
        </div>

      </div>

      {/* ================================== LEAVE DETAIL MODAL VIEW ================================== */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black text-[#1b3a60] dark:text-slate-350 uppercase tracking-wider">Leave Details Review</span>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="flex items-center gap-3 border-b pb-3">
                <span className="text-2xl">👤</span>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{selectedRequest.name}</h4>
                  <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">{selectedRequest.userType} Account</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between"><span className="text-slate-400 block uppercase text-[9px] font-bold">Leave Category</span><span className="font-extrabold">{selectedRequest.leaveType}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 block uppercase text-[9px] font-bold">Apply Date</span><span className="font-extrabold">{selectedRequest.applyDate}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 block uppercase text-[9px] font-bold">Leave Duration</span><span className="font-extrabold">{selectedRequest.duration} Day(s)</span></div>
                <div className="flex justify-between"><span className="text-slate-400 block uppercase text-[9px] font-bold">Date Range</span><span className="font-extrabold">{selectedRequest.dateRange}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 block uppercase text-[9px] font-bold">Status Badge</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    selectedRequest.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                    selectedRequest.status === 'Reject' ? 'bg-red-50 text-red-500' :
                    'bg-amber-50 text-amber-600'
                  }`}>{selectedRequest.status}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
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

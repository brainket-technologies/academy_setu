'use client'

import React, { useState, useEffect } from 'react'
import { fetchLeadStatuses, saveLeadStatus, deleteLeadStatus } from './actions'
import { Edit, Trash2 } from 'lucide-react'

export default function LeadsStatusPage() {
  const [statuses, setStatuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [statusName, setStatusName] = useState('')
  const [textColor, setTextColor] = useState('#ef4444')
  const [bgColor, setBgColor] = useState('#27272a')

  useEffect(() => {
    loadStatuses()
  }, [])

  const loadStatuses = async () => {
    setLoading(true)
    const res = await fetchLeadStatuses()
    if (res.success) {
      setStatuses(res.data || [])
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!statusName) return alert('Status Name is required')

    setSubmitting(true)
    const res = await saveLeadStatus({ statusName, textColor, bgColor })
    
    if (res.success) {
      setStatusName('')
      setTextColor('#ef4444')
      setBgColor('#27272a')
      loadStatuses()
    } else {
      alert('Error creating status')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this status?')) {
       await deleteLeadStatus(id)
       loadStatuses()
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-10">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Leads Status</h1>
      </div>

      {/* Add Status Form */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">Add Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
          <div className="flex flex-col gap-1.5 md:col-span-1 lg:col-span-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1">Status Name</label>
            <input 
              value={statusName} onChange={(e) => setStatusName(e.target.value)}
              type="text" placeholder="Enter Status Name" 
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1">Text Color</label>
            <div className="relative">
              <input 
                type="text" value="Choose a Color" readOnly
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 pr-12 focus:outline-none"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded overflow-hidden">
                <input 
                  type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1">Background Color</label>
            <div className="relative">
              <input 
                type="text" value="Choose Background Color" readOnly
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 pr-12 focus:outline-none"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded overflow-hidden">
                <input 
                  type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1 lg:ml-auto">
             <button onClick={handleCreate} disabled={submitting} className="px-10 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors w-full sm:w-auto h-[38px]">
               {submitting ? 'Saving...' : 'Save'}
             </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex-1 mt-2">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">All Statuses</h2>
        <div className="border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-teal-50/50 dark:bg-teal-900/10 text-xs font-bold text-slate-500 border-b border-slate-100 dark:border-slate-700">
                  <th className="py-4 px-4 font-semibold text-center w-20">S. No.</th>
                  <th className="py-4 px-4 font-semibold text-center">Name</th>
                  <th className="py-4 px-4 font-semibold text-center">Created At</th>
                  <th className="py-4 px-4 font-semibold text-center w-32">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400">Loading...</td></tr>
                ) : statuses.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400">No statuses found. Add one!</td></tr>
                ) : (
                  statuses.map((status, i) => (
                    <tr key={status.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                      <td className="py-4 px-4 text-center font-semibold text-slate-600">{i + 1}.</td>
                      <td className="py-4 px-4 text-center text-slate-600 font-medium">
                         <span className="px-3 py-1 rounded font-bold" style={{ color: status.text_color, backgroundColor: status.bg_color }}>
                           {status.status_name}
                         </span>
                      </td>
                      <td className="py-4 px-4 text-center text-slate-500 text-[11px]">
                         {new Date(status.created_at).toLocaleDateString()} <br/>
                         {new Date(status.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="w-7 h-7 rounded bg-emerald-50 text-emerald-500 hover:bg-emerald-100 flex items-center justify-center" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(status.id)} className="w-7 h-7 rounded bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination Dummy */}
        <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-500 px-2">
          <span>Showing 1-{Math.min(10, statuses.length)} of {statuses.length} Entries</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400">«</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400">‹</button>
            <button className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-teal-600">2</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-teal-600">›</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-teal-600">»</button>
          </div>
        </div>
      </div>
    </div>
  )
}

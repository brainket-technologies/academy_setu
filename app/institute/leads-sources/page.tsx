'use client'

import React, { useState, useEffect } from 'react'
import { fetchLeadSources, saveLeadSource, deleteLeadSource } from './actions'
import { Plus, X, Edit, Trash2 } from 'lucide-react'

export default function LeadsSourcesPage() {
  const [sources, setSources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    setLoading(true)
    const res = await fetchLeadSources()
    if (res.success) {
      setSources(res.data || [])
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!categoryName) return alert('Category Name is required')
    
    setSubmitting(true)
    const data = {
      categoryName,
      isUserRole: false,
      userRole: null,
      options: []
    }
    
    const res = await saveLeadSource(data)
    if (res.success) {
      setCategoryName('')
      loadSources()
    } else {
      alert('Error creating source')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this source?')) {
       await deleteLeadSource(id)
       loadSources()
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-10">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Leads Sources</h1>
      </div>

      {/* Create Source Form */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">Create Source</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1">Category Name</label>
            <input 
              value={categoryName} onChange={(e) => setCategoryName(e.target.value)}
              type="text" placeholder="Teacher" 
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>

          <div className="lg:col-span-1 flex items-end">
             <button onClick={handleCreate} disabled={submitting} className="px-10 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors w-full sm:w-auto h-[38px]">
               {submitting ? 'Saving...' : 'Create'}
             </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex-1 mt-2">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">All Sources</h2>
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
                ) : sources.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400">No sources found. Create one!</td></tr>
                ) : (
                  sources.map((source, i) => (
                    <tr key={source.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                      <td className="py-4 px-4 text-center font-semibold text-slate-600">{i + 1}.</td>
                      <td className="py-4 px-4 text-center text-slate-600 font-medium">
                         {source.category_name}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-500 text-[11px]">
                         {new Date(source.created_at).toLocaleDateString()} <br/>
                         {new Date(source.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="w-7 h-7 rounded bg-emerald-50 text-emerald-500 hover:bg-emerald-100 flex items-center justify-center" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(source.id)} className="w-7 h-7 rounded bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center" title="Delete">
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
          <span>Showing 1-{Math.min(10, sources.length)} of {sources.length} Entries</span>
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

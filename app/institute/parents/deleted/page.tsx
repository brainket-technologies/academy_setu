'use client'

import React, { useState, useEffect } from 'react'
import { Search, Check, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ParentRecord } from '../page'

export default function DeletedParentsPage() {
  const [parents, setParents] = useState<ParentRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('school_institute_parents')
    if (saved) {
      try {
        setParents(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const handleRestore = (id: number) => {
    const updated = parents.map(p => {
      if (p.id === id) {
        return {
          ...p,
          deleted: false
        }
      }
      return p
    })
    setParents(updated)
    localStorage.setItem('school_institute_parents', JSON.stringify(updated))
    toast.success('Parent restored successfully!')
  }

  const totalParentsCount = parents.filter(p => !p.deleted).length
  const deletedParentsCount = parents.filter(p => p.deleted).length

  const filtered = parents.filter(p => {
    if (!p.deleted) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      p.contact.includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Deleted Parents</h1>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Name, mobile no." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
          />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          <Link href="/institute/parents" className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors">
            Total Parents <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs">{String(totalParentsCount).padStart(2, '0')}</span>
          </Link>
          <Link href="/institute/parents/deleted" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold shadow-sm">
            <Check className="w-4 h-4" /> Deleted Parents <span className="bg-white text-teal-600 px-1.5 py-0.5 rounded text-xs">{String(deletedParentsCount).padStart(2, '0')}</span>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">S. No.</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Parent Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-center">Student</th>
                <th className="px-4 py-3">Fees</th>
                <th className="px-4 py-3">Deleted At</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((parent, i) => (
                <tr key={parent.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-medium">{i + 1}.</td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{parent.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={parent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parent.name)}`} alt="" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 opacity-70 grayscale" />
                      <span className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{parent.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">{parent.contact}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-200">{parent.studentCount || 0}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{parent.fees || '0/-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col text-[11px] font-semibold text-slate-500">
                      <span>{parent.deletedAtDate || 'Recent'}</span>
                      <span>{parent.deletedAtTime || ''}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => handleRestore(parent.id)}
                        className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors shadow-sm"
                        title="Restore"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold text-sm">
                    No deleted parents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
            <span>Showing 1-{filtered.length} of {filtered.length} Entries</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded flex items-center justify-center bg-teal-600 text-white font-bold shadow-sm">1</button>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}

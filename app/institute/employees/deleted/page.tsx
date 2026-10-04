'use client'

import React, { useState, useEffect } from 'react'
import { Search, RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { fetchEmployees, fetchDeletedEmployees, restoreEmployee, permanentDeleteEmployee } from '../actions'

export default function DeletedEmployeesPage() {
  const [deletedEmployees, setDeletedEmployees] = useState<any[]>([])
  const [totalActiveCount, setTotalActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const loadData = async () => {
    setLoading(true)
    const [empRes, delRes] = await Promise.all([
      fetchEmployees(),
      fetchDeletedEmployees()
    ])

    if (empRes.success) {
      setTotalActiveCount((empRes.data || []).length)
    }
    if (delRes.success) {
      setDeletedEmployees(delRes.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRestore = async (id: string, name: string) => {
    setRestoringId(id)
    const res = await restoreEmployee(id)
    if (res.success) {
      toast.success(`Employee "${name}" restored successfully`)
      setDeletedEmployees(prev => prev.filter(e => e.id !== id))
      setTotalActiveCount(c => c + 1)
    } else {
      toast.error(res.error || 'Failed to restore employee')
    }
    setRestoringId(null)
  }

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete employee "${name}"? This action cannot be undone.`)) return

    const res = await permanentDeleteEmployee(id)
    if (res.success) {
      toast.success(`Employee "${name}" permanently deleted`)
      setDeletedEmployees(prev => prev.filter(e => e.id !== id))
    } else {
      toast.error(res.error || 'Failed to delete employee')
    }
  }

  const filteredEmployees = deletedEmployees.filter(emp => {
    const q = searchTerm.toLowerCase().trim()
    return (
      (emp.name || '').toLowerCase().includes(q) ||
      (emp.username || '').toLowerCase().includes(q) ||
      (emp.contact || '').includes(q) ||
      (emp.email || '').toLowerCase().includes(q) ||
      (emp.role || '').toLowerCase().includes(q)
    )
  })

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Deleted Employees</h1>
          <p className="text-xs text-slate-500 font-medium">View and restore previously deleted employees</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search deleted employees..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          <Link href="/institute/employees" className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors">
            Total Employee <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[11px] font-black">{totalActiveCount.toString().padStart(2, '0')}</span>
          </Link>
          <Link href="/institute/employees/deleted" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm">
            <RotateCcw className="w-4 h-4" /> Deleted Employee <span className="bg-white text-teal-600 px-1.5 py-0.5 rounded text-[11px] font-black">{deletedEmployees.length.toString().padStart(2, '0')}</span>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3.5 w-14">S. No.</th>
                <th className="px-4 py-3.5">Username</th>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Joining Date</th>
                <th className="px-4 py-3.5 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                      <span className="font-semibold text-xs">Loading deleted employees...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((emp, i) => {
                  const sNo = (currentPage - 1) * itemsPerPage + i + 1
                  return (
                    <tr key={emp.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3.5 text-slate-500 font-bold text-xs">{sNo}.</td>
                      <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-200">{emp.username || '—'}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name)}`} 
                            alt="" 
                            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 object-cover" 
                          />
                          <span className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                          {emp.role || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium">{emp.contact || '—'}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium">{emp.email || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap text-rose-500 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60">
                          ● Deleted
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium whitespace-nowrap text-xs">{emp.joinDate || '—'}</td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            disabled={restoringId === emp.id}
                            onClick={() => handleRestore(emp.id, emp.name)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold transition-colors cursor-pointer"
                            title="Restore Employee"
                          >
                            {restoringId === emp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                            <span>Restore</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermanentDelete(emp.id, emp.name)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 flex items-center hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold transition-colors cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 font-medium text-sm">
                    {searchTerm ? 'No deleted employees match your search.' : 'No deleted employees found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-bold text-slate-500">
          <span>Showing {paginatedEmployees.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} Entries</span>
          <div className="flex items-center gap-1">
            <button 
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button 
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
              <button 
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  currentPage === pageNum 
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button 
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

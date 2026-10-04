'use client'

import React, { useState, useEffect } from 'react'
import { Download, Upload, Plus, Search, MoreVertical, Eye, Pencil, Trash2, ShieldCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { fetchEmployees, fetchDeletedEmployees, deleteEmployee } from './actions'
import AddEmployeeModal from './components/AddEmployeeModal'

export default function AllEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [deletedCount, setDeletedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
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
      setEmployees(empRes.data || [])
    }
    if (delRes.success) {
      setDeletedCount((delRes.data || []).length)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to move employee "${name}" to deleted?`)) return

    const res = await deleteEmployee(id)
    if (res.success) {
      toast.success(`Employee "${name}" moved to deleted`)
      setEmployees(prev => prev.filter(e => e.id !== id))
      setDeletedCount(c => c + 1)
      setActiveDropdown(null)
    } else {
      toast.error(res.error || 'Failed to delete employee')
    }
  }

  const filteredEmployees = employees.filter(emp => {
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
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">All Employees</h1>
          <p className="text-xs text-slate-500 font-medium">Manage and view employee directory</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, mobile, role..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setShowAddModal(true)} 
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          <Link href="/institute/employees" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm">
            <Check className="w-4 h-4" /> Total Employee <span className="bg-white text-teal-600 px-1.5 py-0.5 rounded text-[11px] font-black">{employees.length.toString().padStart(2, '0')}</span>
          </Link>
          <Link href="/institute/employees/deleted" className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors">
            Deleted Employee <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[11px] font-black">{deletedCount.toString().padStart(2, '0')}</span>
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
                <th className="px-4 py-3.5 text-center w-36">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                      <span className="font-semibold text-xs">Loading employees...</span>
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
                        <Link href={`/institute/employees/${emp.id}`} className="flex items-center gap-2.5 group">
                          <img 
                            src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name)}`} 
                            alt="" 
                            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 object-cover group-hover:border-teal-500 transition-colors" 
                          />
                          <span className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap group-hover:text-teal-600 transition-colors">{emp.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                          {emp.role || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium">{emp.contact || '—'}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium">{emp.email || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap inline-flex items-center gap-1 ${
                          emp.status === 'Active' 
                            ? 'text-emerald-600 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60' 
                            : 'text-rose-500 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium whitespace-nowrap text-xs">{emp.joinDate || '—'}</td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Direct View */}
                          <Link 
                            href={`/institute/employees/${emp.id}`}
                            className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
                            title="View Employee"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Direct Edit */}
                          <Link 
                            href={`/institute/employees/${emp.id}/edit`}
                            className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                            title="Edit Employee"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button 
                            type="button"
                            onClick={() => handleDelete(emp.id, emp.name)}
                            className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
                            title="Delete Employee"
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
                    {searchTerm ? 'No employees found matching your search.' : 'No employees added yet.'}
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

      {/* Add Employee Modal Popup */}
      <AddEmployeeModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={loadData} 
      />
    </div>
  )
}

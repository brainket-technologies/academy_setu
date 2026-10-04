'use client'

import React, { useState, useEffect } from 'react'
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Plus, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { fetchEmployeeRoles, createEmployeeRole, updateEmployeeRole, deleteEmployeeRole } from './actions'

export default function EmployeeRolesPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [roleInput, setRoleInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Edit State
  const [editingRole, setEditingRole] = useState<any | null>(null)
  const [editName, setEditName] = useState('')
  const [updating, setUpdating] = useState(false)

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const loadRoles = async () => {
    setLoading(true)
    const res = await fetchEmployeeRoles()
    if (res.success) {
      setRoles(res.data || [])
    } else {
      toast.error(res.error || 'Failed to load employee roles')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = roleInput.trim()
    if (!trimmed) {
      toast.error('Please enter a role name')
      return
    }

    setCreating(true)
    const res = await createEmployeeRole(trimmed)
    if (res.success) {
      toast.success(`Role "${trimmed}" created successfully`)
      setRoleInput('')
      setRoles(prev => [res.data, ...prev])
    } else {
      toast.error(res.error || 'Failed to create role')
    }
    setCreating(false)
  }

  const handleUpdate = async () => {
    if (!editingRole) return
    const trimmed = editName.trim()
    if (!trimmed) {
      toast.error('Role name cannot be empty')
      return
    }

    setUpdating(true)
    const res = await updateEmployeeRole(editingRole.id, trimmed)
    if (res.success) {
      toast.success('Role updated successfully')
      setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, name: trimmed } : r))
      setEditingRole(null)
      setEditName('')
    } else {
      toast.error(res.error || 'Failed to update role')
    }
    setUpdating(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the role "${name}"?`)) return

    setDeletingId(id)
    const res = await deleteEmployeeRole(id)
    if (res.success) {
      toast.success(`Role "${name}" deleted successfully`)
      setRoles(prev => prev.filter(r => r.id !== id))
    } else {
      toast.error(res.error || 'Failed to delete role')
    }
    setDeletingId(null)
  }

  const filteredRoles = roles.filter(r =>
    (r.name || '').toLowerCase().includes(searchTerm.toLowerCase().trim())
  )

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage) || 1
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Employee Role</h1>
          <p className="text-xs text-slate-500 font-medium">Manage and configure designations and system roles for staff</p>
        </div>
      </div>

      {/* Create Role */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Create Role</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-end gap-4 max-w-lg">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Role Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Guard, Accountant, Supervisor" 
              value={roleInput}
              onChange={e => setRoleInput(e.target.value)}
              disabled={creating}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full placeholder:text-slate-400" 
            />
          </div>
          <button 
            type="submit"
            disabled={creating || !roleInput.trim()}
            className="px-8 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 active:scale-95 transition-all shadow-sm shadow-teal-600/20 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Create</span>
          </button>
        </form>
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">All Roles</h2>
            <p className="text-xs text-slate-500">Total {roles.length} roles available</p>
          </div>
          <div className="relative w-full md:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by role name..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="pl-9 pr-4 py-2 w-full md:w-64 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3.5 w-16">S. No.</th>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5 text-center">Total Employee</th>
                <th className="px-4 py-3.5 text-center">Created At</th>
                <th className="px-4 py-3.5 text-center w-36">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                      <span className="font-semibold text-xs">Loading roles...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRoles.length > 0 ? (
                paginatedRoles.map((role, i) => {
                  const sNo = (currentPage - 1) * itemsPerPage + i + 1
                  const dateStr = role.formattedCreatedAt || (role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A')
                  const parts = dateStr.split(' ')
                  return (
                    <tr key={role.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3.5 text-slate-500 font-bold text-xs">{sNo}.</td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{role.name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                          {role.totalEmployees || '0'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-500 text-xs">
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{parts[0]}</span>
                          {parts.length > 1 && (
                            <span className="text-[11px] text-slate-400">{parts.slice(1).join(' ')}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Role */}
                          <button 
                            type="button"
                            onClick={() => { setEditingRole(role); setEditName(role.name) }}
                            className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer" 
                            title="Edit Role"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Role */}
                          <button 
                            type="button"
                            disabled={deletingId === role.id}
                            onClick={() => handleDelete(role.id, role.name)}
                            className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors disabled:opacity-40 cursor-pointer" 
                            title="Delete Role"
                          >
                            {deletingId === role.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium text-sm">
                    {searchTerm ? 'No roles found matching your search.' : 'No roles added yet. Create one above!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-bold text-slate-500">
          <span>Showing {paginatedRoles.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredRoles.length)} of {filteredRoles.length} Entries</span>
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

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={() => setEditingRole(null)}>
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Edit Role</h3>
              <button 
                type="button"
                onClick={() => setEditingRole(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">Role Name *</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Enter Role Name"
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updating || !editName.trim()}
                  onClick={handleUpdate}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

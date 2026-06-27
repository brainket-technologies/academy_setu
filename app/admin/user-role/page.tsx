'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Search, Loader2, Trash2, X, Plus, Filter, Download,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, FileText, Upload,
  Eye, Edit3, Shield, Mail, Phone, Key, Contact, Image
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface UserRecord {
  id: string
  name: string
  email: string
  role: string
  phone: string
  avatar_url: string
  is_active: boolean
  id_no: string
  id_card_url: string
  created_at: string
}

function UserRoleContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role') || 'All'

  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Search & Filters
  const [searchInput, setSearchInput] = useState('')
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | 'Admin' | 'Manager' | 'BDM' | 'Custom'>('All')

  // Sync tab with URL parameter
  useEffect(() => {
    if (roleParam === 'Admin' || roleParam === 'Manager' || roleParam === 'BDM' || roleParam === 'Custom' || roleParam === 'All') {
      setActiveTab(roleParam as any)
    }
  }, [roleParam])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Add / Edit Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Admin',
    id_no: '',
    status: 'Active',
    password: '',
    avatar_url: ''
  })
  const [submittingForm, setSubmittingForm] = useState(false)

  // Delete States
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch users list
  const fetchUsers = useCallback(async (page = 1, search = '', tab = activeTab) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        role: tab
      })
      if (search) params.append('search', search)

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error('Failed to load users')
      }
    } catch {
      toast.error('Error loading users')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchUsers(currentPage, searchText, activeTab)
  }, [currentPage, searchText, activeTab, fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchText(searchInput)
    setCurrentPage(1)
  }

  const handleTabChange = (tab: 'All' | 'Admin' | 'Manager' | 'BDM' | 'Custom') => {
    setActiveTab(tab)
    setCurrentPage(1)
    
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'All') {
      params.delete('role')
    } else {
      params.set('role', tab)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleOpenAdd = () => {
    setUserForm({
      name: '',
      email: '',
      phone: '',
      role: 'Admin',
      id_no: '',
      status: 'Active',
      password: '',
      avatar_url: ''
    })
    setEditingUserId(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEdit = (user: UserRecord) => {
    setEditingUserId(user.id)
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'Admin',
      id_no: user.id_no || '',
      status: user.is_active ? 'Active' : 'Inactive',
      password: '',
      avatar_url: user.avatar_url || ''
    })
    setIsAddModalOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userForm.name || !userForm.email || !userForm.role || (!editingUserId && !userForm.password)) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmittingForm(true)
    try {
      const url = editingUserId ? `/api/admin/users/${editingUserId}` : '/api/admin/users'
      const method = editingUserId ? 'PUT' : 'POST'
      
      const payload = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        phone: userForm.phone,
        id_no: userForm.id_no,
        is_active: userForm.status === 'Active',
        avatar_url: userForm.avatar_url,
        ...(userForm.password ? { password: userForm.password } : {})
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingUserId ? 'User updated successfully' : 'User created successfully')
        setIsAddModalOpen(false)
        fetchUsers(currentPage, searchText, activeTab)
      } else {
        toast.error(data.error || 'Failed to save user')
      }
    } catch {
      toast.error('Error saving user')
    } finally {
      setSubmittingForm(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${deleteTargetId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('User deleted successfully')
        setDeleteTargetId(null)
        fetchUsers(currentPage, searchText, activeTab)
      } else {
        toast.error(data.error || 'Failed to delete user')
      }
    } catch {
      toast.error('Error deleting user')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleStatus = async (user: UserRecord) => {
    try {
      const updatedStatus = !user.is_active
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: updatedStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Status updated to ${updatedStatus ? 'Active' : 'Inactive'}`)
        fetchUsers(currentPage, searchText, activeTab)
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch {
      toast.error('Error updating status')
    }
  }

  const handleExport = () => {
    try {
      const headers = ['S.No.', 'Name', 'Id No.', 'User Role', 'Mobile No.', 'Email', 'Status']
      const csvRows = [headers.join(',')]
      users.forEach((row, i) => {
        const values = [
          String(i + 1),
          `"${row.name}"`,
          `"${row.id_no}"`,
          `"${row.role}"`,
          `"${row.phone}"`,
          `"${row.email}"`,
          `"${row.is_active ? 'Active' : 'Inactive'}"`
        ]
        csvRows.push(values.join(','))
      })
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.setAttribute('download', `user_roles_${new Date().toISOString().split('T')[0]}.csv`)
      a.click()
      toast.success('Data exported successfully')
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Page Title & Actions Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">User Role</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure and manage administrative roles, credentials, and access settings.</p>
          </div>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative w-64">
              <input
                type="text"
                placeholder="Search by Name, Mobile no."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </form>

            <button
              onClick={() => toast.info('Filters summary')}
              className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/10 transition-colors cursor-pointer"
              title="Filter Roles"
            >
              <Filter className="w-5 h-5" />
            </button>

            <button
              onClick={handleExport}
              className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-650 dark:text-slate-350 hover:text-teal-650 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push('/admin/user-role/create')}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/10 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Tab Filters matching Screenshot 1-5 */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 border-b border-slate-100 dark:border-slate-700 pb-1">
          {(['All', 'Admin', 'Manager', 'BDM', 'Custom'] as const).map(tab => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-8 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/10'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Users Table List */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="py-4 px-6">S. No.</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Id No.</th>
                  <th className="py-4 px-6 text-center">ID Card</th>
                  <th className="py-4 px-6">User Role</th>
                  <th className="py-4 px-6">Mobile No.</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-600 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                        <span className="text-xs font-medium text-slate-400">Loading user accounts...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No user accounts found under this tab.
                    </td>
                  </tr>
                ) : (
                  users.map((row, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 font-medium text-slate-400">{rowNum}</td>
                        <td className="py-4 px-6 font-semibold text-slate-850 dark:text-slate-200">
                          <div className="flex items-center gap-2.5">
                            {row.avatar_url ? (
                              <img
                                src={row.avatar_url}
                                alt={row.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xs uppercase">
                                {row.name.charAt(0)}
                              </div>
                            )}
                            {row.name}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">{row.id_no || '-'}</td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => toast.success(`ID Card layout preview for ${row.name}`)}
                            className="p-1.5 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-teal-600 transition-all cursor-pointer"
                            title="Preview ID Card"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">{row.role}</td>
                        <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">{row.phone || '-'}</td>
                        <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">{row.email}</td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleStatus(row)}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                              row.is_active
                                ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-900/50'
                                : 'bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 border border-red-200/50 dark:border-red-900/50'
                            }`}
                            title={`Click to mark as ${row.is_active ? 'Inactive' : 'Active'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${row.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                            {row.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => router.push(`/admin/user-role/create?id=${row.id}`)}
                              className="p-1.5 bg-green-50 dark:bg-green-950/40 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-xl transition-colors cursor-pointer"
                              title="Edit User"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(row.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} Entries
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-teal-600 text-white border border-teal-650 rounded-lg text-xs font-bold">
                  {currentPage}
                </span>
                {totalPages >= 2 && (
                  <button
                    disabled={currentPage === totalPages || loading}
                    onClick={() => setCurrentPage(2)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                      currentPage === 2
                        ? 'bg-teal-600 text-white border-teal-650'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    2
                  </button>
                )}
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT USER DIALOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0 cursor-default" onClick={() => setIsAddModalOpen(false)} />

          <form
            onSubmit={handleFormSubmit}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-6 w-full max-w-lg relative flex flex-col animate-in zoom-in-95 duration-200 z-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              {editingUserId ? 'Edit User Account' : 'Add User Account'}
            </h3>

            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-655 dark:text-slate-400 mb-1.5 font-medium">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={userForm.name}
                    onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                  />
                  <Contact className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-655 dark:text-slate-400 mb-1.5 font-medium">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={userForm.email}
                    onChange={e => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                  />
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-655 dark:text-slate-400 mb-1.5 font-medium">Mobile No.</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. 9999999999"
                      value={userForm.phone}
                      onChange={e => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Id No */}
                <div>
                  <label className="block text-xs font-semibold text-slate-655 dark:text-slate-400 mb-1.5 font-medium">Id No.</label>
                  <input
                    type="text"
                    placeholder="e.g. AS123"
                    value={userForm.id_no}
                    onChange={e => setUserForm(prev => ({ ...prev, id_no: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-655 dark:text-slate-400 mb-1.5 font-medium">User Role *</label>
                  <select
                    required
                    value={userForm.role}
                    onChange={e => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="BDM">BDM</option>
                    <option value="Support Team">Support Team</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-655 dark:text-slate-400 mb-1.5 font-medium">Status</label>
                  <select
                    value={userForm.status}
                    onChange={e => setUserForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-655 dark:text-slate-400 mb-1.5 font-medium">
                  Password {editingUserId ? '(Leave blank to keep current)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required={!editingUserId}
                    placeholder="Enter password"
                    value={userForm.password}
                    onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                  />
                  <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-655 dark:text-slate-400 mb-1.5 font-medium">Avatar Image URL</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. https://avatar.iran.liara.run/public/1"
                    value={userForm.avatar_url}
                    onChange={e => setUserForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                  />
                  <Image className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end gap-3 mt-8 border-t border-slate-100 dark:border-slate-700 pt-4">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-305 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingForm}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-600/10 disabled:opacity-50"
              >
                {submittingForm && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete User Account"
        description="Are you sure you want to delete this administrative user account? This action cannot be undone."
      />
    </AdminLayout>
  )
}

export default function UserRolePage() {
  return (
    <React.Suspense fallback={
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
          <span className="text-sm font-semibold text-slate-500">Loading page...</span>
        </div>
      </AdminLayout>
    }>
      <UserRoleContent />
    </React.Suspense>
  )
}

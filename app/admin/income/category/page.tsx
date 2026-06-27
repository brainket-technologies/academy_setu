'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Loader2, Trash2, Edit3, Tag, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface Category {
  id: string
  name: string
  description: string
  category_type: string
  created_at: string
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [categoryType, setCategoryType] = useState('Income')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Filter State
  const [filterType, setFilterType] = useState('')
  const [searchText, setSearchText] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchCategories = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType) params.append('category_type', filterType)
      if (searchText) params.append('search', searchText)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      params.append('page', String(page))
      params.append('pageSize', String(pageSize))

      const res = await fetch(`/api/admin/income/categories?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
        setTotalCount(data.totalCount)
        setCurrentPage(page)
      } else {
        toast.error('Failed to load categories')
      }
    } catch {
      toast.error('Error loading categories')
    } finally {
      setLoading(false)
    }
  }, [filterType, searchText, startDate, endDate, pageSize])

  useEffect(() => {
    fetchCategories(1)
  }, [fetchCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Category name is required')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId ? `/api/admin/income/categories/${editingId}` : '/api/admin/income/categories'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category_type: categoryType
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Category updated successfully' : 'Category created successfully')
        setName('')
        setDescription('')
        setCategoryType('Income')
        setEditingId(null)
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to save category')
      }
    } catch {
      toast.error('Error saving category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setDescription(cat.description || '')
    setCategoryType(cat.category_type || 'Income')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName('')
    setDescription('')
    setCategoryType('Income')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/income/categories/${deleteTargetId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Category deleted successfully')
        setDeleteTargetId(null)
        if (deleteTargetId === editingId) {
          handleCancelEdit()
        }
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to delete category')
      }
    } catch {
      toast.error('Error deleting category')
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatDateTime = (timestampStr: string) => {
    if (!timestampStr) return '-'
    try {
      const d = new Date(timestampStr)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      
      let hours = d.getHours()
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12
      hours = hours ? hours : 12
      const hrStr = String(hours).padStart(2, '0')
      
      return `${day}/${month}/${year} @ ${hrStr}:${minutes} ${ampm}`
    } catch {
      return '-'
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create Category</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure income and expense categories for sorting revenue flow.</p>
        </div>

        {/* Top Form Section (Full Width Card) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
            <Tag className="w-5 h-5 text-teal-600" /> {editingId ? 'Edit Category' : 'Add Category'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 font-medium">Category Type *</label>
                <select
                  required
                  value={categoryType}
                  onChange={e => setCategoryType(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium cursor-pointer"
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 font-medium">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Category name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1.5 font-medium">Description</label>
              <textarea
                placeholder="Enter Description"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none font-medium"
              />
            </div>

            <div className="flex justify-end gap-2.5 mt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-305 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-teal-600/10 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom List Section */}
        <div className="flex flex-col gap-4">
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">Category Type</label>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                >
                  <option value="">All</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">Search</label>
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setSearchText(searchInput)
                    }
                  }}
                  onBlur={() => setSearchText(searchInput)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                />
              </div>

              {/* From Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* List Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="py-4 px-6">S.No.</th>
                    <th className="py-4 px-6">Category Type</th>
                    <th className="py-4 px-6">Category Name</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Created At</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-600 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                          <span className="text-xs font-medium text-slate-400">Loading categories...</span>
                        </div>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((row, idx) => {
                      const rowNum = (currentPage - 1) * pageSize + idx + 1
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6 font-medium text-slate-400">{rowNum}</td>
                          <td className="py-4 px-6 font-semibold text-slate-750 dark:text-slate-350">{row.category_type}</td>
                          <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                          <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">{row.description || '-'}</td>
                          <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">{formatDateTime(row.created_at)}</td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleStartEdit(row)}
                                className="p-1.5 bg-green-55 dark:bg-green-950/40 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-xl transition-colors cursor-pointer"
                                title="Edit Category"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTargetId(row.id)}
                                className="p-1.5 bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors cursor-pointer"
                                title="Delete Category"
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
                    onClick={() => fetchCategories(1)}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === 1 || loading}
                    onClick={() => fetchCategories(Math.max(currentPage - 1, 1))}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-teal-600 text-white border border-teal-600 rounded-lg text-xs font-bold">
                    {currentPage}
                  </span>
                  <button
                    disabled={currentPage === totalPages || loading}
                    onClick={() => fetchCategories(Math.min(currentPage + 1, totalPages))}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages || loading}
                    onClick={() => fetchCategories(totalPages)}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Category"
        description="Are you sure you want to delete this category? Any transactions linked to it may lose their categorization."
      />
    </AdminLayout>
  )
}

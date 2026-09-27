'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, X, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'

interface CategoryRecord {
  id: number
  categoryName: string
  order: number
  noOfStudents: number
  createdAt: string
  deleted: boolean
}

const INITIAL_CATEGORIES: CategoryRecord[] = [
  {
    id: 1,
    categoryName: 'General',
    order: 1,
    noOfStudents: 0,
    createdAt: '27/09/2026\n12:00 PM',
    deleted: false
  },
  {
    id: 2,
    categoryName: 'OBC',
    order: 2,
    noOfStudents: 0,
    createdAt: '27/09/2026\n12:00 PM',
    deleted: false
  },
  {
    id: 3,
    categoryName: 'SC',
    order: 3,
    noOfStudents: 0,
    createdAt: '27/09/2026\n12:00 PM',
    deleted: false
  },
  {
    id: 4,
    categoryName: 'ST',
    order: 4,
    noOfStudents: 0,
    createdAt: '27/09/2026\n12:00 PM',
    deleted: false
  },
  {
    id: 5,
    categoryName: 'EWS',
    order: 5,
    noOfStudents: 0,
    createdAt: '27/09/2026\n12:00 PM',
    deleted: false
  }
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>(INITIAL_CATEGORIES)
  const [activeTab, setActiveTab] = useState<'All' | 'Deleted'>('All')

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryRecord | null>(null)

  // Form state
  const [categoryNameInput, setCategoryNameInput] = useState('')
  const [categoryOrderInput, setCategoryOrderInput] = useState('')
  const [formError, setFormError] = useState('')

  // Filter Toggle state
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('school_masters_categories')
    if (saved) {
      try {
        const parsed: CategoryRecord[] = JSON.parse(saved)
        const sorted = parsed.map((c, index) => ({
          ...c,
          order: c.order || index + 1
        })).sort((a, b) => (a.order || 0) - (b.order || 0))
        setCategories(sorted)
        localStorage.setItem('school_masters_categories', JSON.stringify(sorted))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_masters_categories', JSON.stringify(INITIAL_CATEGORIES))
    }
  }, [])

  const handleOpenAdd = () => {
    setCategoryNameInput('')
    const maxOrder = categories.filter(c => !c.deleted).reduce((max, c) => Math.max(max, c.order || 0), 0)
    setCategoryOrderInput(String(maxOrder + 1))
    setFormError('')
    setAddModalOpen(true)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const trimmedName = categoryNameInput.trim().replace(/\s+/g, ' ')
    if (!trimmedName) {
      setFormError('Please enter a Category Name.')
      return
    }

    const orderNum = parseInt(categoryOrderInput.trim(), 10)
    if (isNaN(orderNum) || orderNum <= 0) {
      setFormError('Please enter a valid Order number (greater than 0).')
      return
    }

    // Check duplicate category name (case-insensitive among active non-deleted categories)
    const isDuplicate = categories.some(
      c => !c.deleted && c.categoryName.trim().replace(/\s+/g, ' ').toLowerCase() === trimmedName.toLowerCase()
    )
    if (isDuplicate) {
      setFormError(`Category name "${trimmedName}" already exists!`)
      return
    }

    const now = new Date()
    const newCategory: CategoryRecord = {
      id: Date.now(),
      categoryName: trimmedName,
      order: orderNum,
      noOfStudents: 0,
      createdAt: now.toLocaleDateString('en-GB') + '\n' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      deleted: false
    }

    const updated = [...categories, newCategory].sort((a, b) => (a.order || 0) - (b.order || 0))
    setCategories(updated)
    localStorage.setItem('school_masters_categories', JSON.stringify(updated))

    setCategoryNameInput('')
    setCategoryOrderInput('')
    setFormError('')
    setAddModalOpen(false)
    toast.success('Category created successfully!')
  }

  const handleOpenEdit = (item: CategoryRecord) => {
    setSelectedCategory(item)
    setCategoryNameInput(item.categoryName)
    setCategoryOrderInput(String(item.order || 1))
    setFormError('')
    setEditModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory) return
    setFormError('')

    const trimmedName = categoryNameInput.trim().replace(/\s+/g, ' ')
    if (!trimmedName) {
      setFormError('Please enter a Category Name.')
      return
    }

    const orderNum = parseInt(categoryOrderInput.trim(), 10)
    if (isNaN(orderNum) || orderNum <= 0) {
      setFormError('Please enter a valid Order number (greater than 0).')
      return
    }

    // Check duplicate category name (case-insensitive among other active categories)
    const isDuplicate = categories.some(
      c => !c.deleted && c.id !== selectedCategory.id && c.categoryName.trim().replace(/\s+/g, ' ').toLowerCase() === trimmedName.toLowerCase()
    )
    if (isDuplicate) {
      setFormError(`Category name "${trimmedName}" already exists!`)
      return
    }

    const updated = categories.map(c => {
      if (c.id === selectedCategory.id) {
        return {
          ...c,
          categoryName: trimmedName,
          order: orderNum
        }
      }
      return c
    }).sort((a, b) => (a.order || 0) - (b.order || 0))

    setCategories(updated)
    localStorage.setItem('school_masters_categories', JSON.stringify(updated))
    setEditModalOpen(false)
    setSelectedCategory(null)
    setCategoryNameInput('')
    setCategoryOrderInput('')
    setFormError('')
    toast.success('Category updated successfully!')
  }

  const handleDelete = (id: number) => {
    const updated = categories.map(c => c.id === id ? { ...c, deleted: true } : c)
    setCategories(updated)
    localStorage.setItem('school_masters_categories', JSON.stringify(updated))
    toast.info('Category moved to deleted list!')
  }

  const handleRestore = (id: number) => {
    const updated = categories.map(c => c.id === id ? { ...c, deleted: false } : c)
    setCategories(updated)
    localStorage.setItem('school_masters_categories', JSON.stringify(updated))
    toast.success('Category restored successfully!')
  }

  const tabCountAll = categories.filter(c => !c.deleted).length
  const tabCountDeleted = categories.filter(c => c.deleted).length

  // Filter logic
  const filtered = categories.filter(c => {
    const matchesTab = activeTab === 'All' ? !c.deleted : c.deleted
    const matchesSearch = searchQuery ? c.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) : true
    return matchesTab && matchesSearch
  })

  return (
    <div className="w-full pb-10 animate-in fade-in duration-300">
      
      {/* Single Unified Card */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-6">

        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h1 className="text-xl font-black text-slate-800">Categories</h1>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Tabs and Filter Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('All')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'All' ? 'bg-teal-600 text-white border-teal-500 font-black' : 'bg-white border text-slate-650 hover:bg-slate-50'}`}
            >
              All <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'All' ? 'bg-teal-750 text-white' : 'bg-slate-100 text-slate-600'}`}>{String(tabCountAll).padStart(2, '0')}</span>
            </button>
            <button
              onClick={() => setActiveTab('Deleted')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'Deleted' ? 'bg-teal-600 text-white border-teal-500 font-black' : 'bg-white border text-slate-655 hover:bg-slate-50'}`}
            >
              Deleted <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'Deleted' ? 'bg-teal-750 text-white' : 'bg-slate-100 text-slate-600'}`}>{String(tabCountDeleted).padStart(2, '0')}</span>
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-colors ${showFilters ? 'bg-slate-100 text-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {/* Toggleable Filters Panel */}
        {showFilters && (
          <div className="bg-slate-50 border rounded-2xl p-5 text-xs font-semibold text-slate-700 animate-in slide-in-from-top-3 duration-200">
            <div className="flex flex-col gap-1.5 max-w-md">
              <label className="text-slate-500 font-bold">Search Category</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search category name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4 text-left">Category Name</th>
                <th className="px-3 py-4 w-20">Order</th>
                <th className="px-3 py-4">No. of Students</th>
                <th className="px-3 py-4 w-36">Create At</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-3 text-slate-450 font-medium">{index + 1}.</td>
                  <td className="px-3 py-3 text-left font-bold text-slate-800">{item.categoryName}</td>
                  <td className="px-3 py-3 font-bold text-slate-700">{item.order}</td>
                  <td className="px-3 py-3 font-bold text-slate-700">{item.noOfStudents}</td>
                  <td className="px-3 py-3 text-slate-500 font-bold whitespace-pre-line leading-tight text-[11px]">
                    {item.createdAt}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {activeTab === 'All' ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-md hover:bg-teal-50 text-teal-600 border border-slate-200 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-500 border border-slate-200 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 border border-slate-200 transition-colors"
                          title="Restore"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-slate-400 font-bold">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Category Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-black text-[#1b3a60] border-b pb-3 mb-6">Add Category</h2>
            
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Category Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. General, OBC, SC, ST, EWS"
                  value={categoryNameInput}
                  onChange={e => {
                    setCategoryNameInput(e.target.value)
                    if (formError) setFormError('')
                  }}
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 text-xs transition-all"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Order <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={categoryOrderInput}
                  onChange={e => {
                    setCategoryOrderInput(e.target.value)
                    if (formError) setFormError('')
                  }}
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 text-xs transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-black text-[#1b3a60] border-b pb-3 mb-6">Edit Category</h2>
            
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Category Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. General, OBC, SC, ST, EWS"
                  value={categoryNameInput}
                  onChange={e => {
                    setCategoryNameInput(e.target.value)
                    if (formError) setFormError('')
                  }}
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 text-xs transition-all"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Order <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={categoryOrderInput}
                  onChange={e => {
                    setCategoryOrderInput(e.target.value)
                    if (formError) setFormError('')
                  }}
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 text-xs transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Search, Loader2, Trash2, X, Plus, Filter, Download,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, FileText, Upload,
  Eye, Edit3, Calendar, DollarSign, CreditCard, User, Layers, Info
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface ExpenseRecord {
  id: string
  trans_id: string
  expense_category: string
  amount: string | number
  payment_mode: string
  expense_date: string
  paid_by: string
  paid_to: string
  payment_account: string
  received_by: string
  approved_by: string
  photo_url: string
  status: string
  created_at: string
}

interface Category {
  id: string
  name: string
  category_type: string
}

interface Party {
  id: string
  name: string
  party_category: string
}

const STAFF_OPTIONS = ['Neeraj', 'Sourabh', 'Kamlesh', 'Priya Singh', 'Amit Verma', 'Sudhir Rawat']

export default function AllExpensesPage() {
  const [records, setRecords] = useState<ExpenseRecord[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)

  // Search & Filter state
  const [searchInput, setSearchInput] = useState('')
  const [searchText, setSearchText] = useState('')
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    payment_mode: '',
    category: '',
    paid_by: '',
    paid_to: ''
  })
  const [activeFilters, setActiveFilters] = useState({
    startDate: '',
    endDate: '',
    payment_mode: '',
    category: '',
    paid_by: '',
    paid_to: ''
  })

  // Add Expense Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    trans_id: '',
    expense_category: '',
    amount: '',
    payment_mode: '',
    expense_date: new Date().toISOString().split('T')[0],
    paid_by: '',
    paid_to: '',
    payment_account: '',
    received_by: '',
    approved_by: '',
    status: 'Paid',
    photo_url: ''
  })
  const [submittingAdd, setSubmittingAdd] = useState(false)

  // Edit Expense Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    trans_id: '',
    expense_category: '',
    amount: '',
    payment_mode: '',
    expense_date: '',
    paid_by: '',
    paid_to: '',
    payment_account: '',
    received_by: '',
    approved_by: '',
    status: '',
    photo_url: ''
  })
  const [submittingEdit, setSubmittingEdit] = useState(false)

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingRecord, setViewingRecord] = useState<ExpenseRecord | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch helper options
  const fetchAuxiliaryData = async () => {
    try {
      const [catRes, partRes] = await Promise.all([
        fetch('/api/admin/income/categories?category_type=Expense'),
        fetch('/api/admin/income/parties?party_category=Expense')
      ])
      
      const catData = await catRes.json()
      const partData = await partRes.json()

      if (catData.success) setCategories(catData.data)
      if (partData.success) setParties(partData.data)
    } catch (err) {
      console.error('Error fetching auxiliary data:', err)
    }
  }

  // Fetch expense records
  const fetchRecords = useCallback(async (page = 1, search = '', activeF = activeFilters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      })
      if (search) params.append('search', search)
      if (activeF.startDate) params.append('startDate', activeF.startDate)
      if (activeF.endDate) params.append('endDate', activeF.endDate)
      if (activeF.payment_mode) params.append('payment_mode', activeF.payment_mode)
      if (activeF.category) params.append('category', activeF.category)
      if (activeF.paid_by) params.append('paid_by', activeF.paid_by)
      if (activeF.paid_to) params.append('paid_to', activeF.paid_to)

      const res = await fetch(`/api/admin/expense/records?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setRecords(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error('Failed to load records')
      }
    } catch {
      toast.error('Error loading records')
    } finally {
      setLoading(false)
    }
  }, [activeFilters])

  useEffect(() => {
    fetchAuxiliaryData()
  }, [])

  useEffect(() => {
    fetchRecords(currentPage, searchText, activeFilters)
  }, [currentPage, searchText, activeFilters, fetchRecords])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchText(searchInput)
    setCurrentPage(1)
  }

  const handleApplyFilters = () => {
    setActiveFilters({ ...filters })
    setCurrentPage(1)
    setIsFilterModalOpen(false)
    toast.success('Filters applied')
  }

  const handleResetFilters = () => {
    const reset = {
      startDate: '',
      endDate: '',
      payment_mode: '',
      category: '',
      paid_by: '',
      paid_to: ''
    }
    setFilters(reset)
    setActiveFilters(reset)
    setCurrentPage(1)
    setIsFilterModalOpen(false)
    toast.success('Filters reset')
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.expense_category || !addForm.amount || !addForm.payment_mode || !addForm.paid_by || !addForm.paid_to) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmittingAdd(true)
    try {
      const res = await fetch('/api/admin/expense/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Expense record added successfully')
        setIsAddModalOpen(false)
        setAddForm({
          trans_id: '',
          expense_category: '',
          amount: '',
          payment_mode: '',
          expense_date: new Date().toISOString().split('T')[0],
          paid_by: '',
          paid_to: '',
          payment_account: '',
          received_by: '',
          approved_by: '',
          status: 'Paid',
          photo_url: ''
        })
        fetchRecords(1, searchText, activeFilters)
      } else {
        toast.error(data.error || 'Failed to add expense record')
      }
    } catch {
      toast.error('Error adding expense record')
    } finally {
      setSubmittingAdd(false)
    }
  }

  const handleOpenEdit = (rec: ExpenseRecord) => {
    setEditingRecordId(rec.id)
    const formattedDate = new Date(rec.expense_date).toISOString().split('T')[0]
    setEditForm({
      trans_id: rec.trans_id || '',
      expense_category: rec.expense_category || '',
      amount: String(rec.amount),
      payment_mode: rec.payment_mode || '',
      expense_date: formattedDate,
      paid_by: rec.paid_by || '',
      paid_to: rec.paid_to || '',
      payment_account: rec.payment_account || '',
      received_by: rec.received_by || '',
      approved_by: rec.approved_by || '',
      status: rec.status || 'Paid',
      photo_url: rec.photo_url || ''
    })
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecordId) return
    if (!editForm.expense_category || !editForm.amount || !editForm.payment_mode || !editForm.paid_by || !editForm.paid_to) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmittingEdit(true)
    try {
      const res = await fetch(`/api/admin/expense/records/${editingRecordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Expense record updated successfully')
        setIsEditModalOpen(false)
        setEditingRecordId(null)
        fetchRecords(currentPage, searchText, activeFilters)
      } else {
        toast.error(data.error || 'Failed to update record')
      }
    } catch {
      toast.error('Error updating record')
    } finally {
      setSubmittingEdit(false)
    }
  }

  const handleOpenView = (rec: ExpenseRecord) => {
    setViewingRecord(rec)
    setIsViewModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/expense/records/${deleteTargetId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Record deleted successfully')
        setDeleteTargetId(null)
        fetchRecords(currentPage, searchText, activeFilters)
      } else {
        toast.error(data.error || 'Failed to delete record')
      }
    } catch {
      toast.error('Error deleting record')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleExport = () => {
    try {
      const headers = ['S.No.', 'Reference No.', 'Expenses Type', 'Amount', 'Payment Mode', 'Expense Date', 'Paid By', 'Paid To', 'Status']
      const csvRows = [headers.join(',')]
      records.forEach((row, i) => {
        const dateStr = new Date(row.expense_date).toLocaleDateString()
        const values = [
          String(i + 1),
          `"${row.trans_id}"`,
          `"${row.expense_category}"`,
          String(row.amount),
          `"${row.payment_mode}"`,
          `"${dateStr}"`,
          `"${row.paid_by}"`,
          `"${row.paid_to}"`,
          `"${row.status}"`
        ]
        csvRows.push(values.join(','))
      })
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.setAttribute('download', `expense_records_${new Date().toISOString().split('T')[0]}.csv`)
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
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">All Expenses</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage, filter, and track all school expenses.</p>
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
              onClick={() => setIsFilterModalOpen(true)}
              className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/10 transition-colors cursor-pointer"
              title="Filter Expenses"
            >
              <Filter className="w-5 h-5" />
            </button>

            <button
              onClick={handleExport}
              className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-teal-650 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/10 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Expenses
            </button>
          </div>
        </div>

        {/* Filters Summary */}
        {(activeFilters.startDate || activeFilters.endDate || activeFilters.payment_mode || activeFilters.category || activeFilters.paid_by || activeFilters.paid_to) && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900 rounded-xl">
            <span className="text-xs font-semibold text-teal-800 dark:text-teal-400">Active filters applied</span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Table View */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="py-4 px-6">S. No.</th>
                  <th className="py-4 px-6">Reference No.</th>
                  <th className="py-4 px-6">Expenses Type</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment Mode</th>
                  <th className="py-4 px-6">Expense Date</th>
                  <th className="py-4 px-6">Paid By</th>
                  <th className="py-4 px-6">Paid To</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Invoice</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-600 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                        <span className="text-xs font-medium text-slate-400">Loading expense records...</span>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No expense records found.
                    </td>
                  </tr>
                ) : (
                  records.map((row, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1
                    const dateStr = new Date(row.expense_date).toLocaleDateString('en-GB')
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 font-medium text-slate-400">{rowNum}</td>
                        <td className="py-4 px-6 font-semibold text-slate-850 dark:text-slate-200">{row.trans_id || '-'}</td>
                        <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">{row.expense_category}</td>
                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100">{Number(row.amount) > 0 ? `${Number(row.amount).toLocaleString('en-IN')}/-` : '0/-'}</td>
                        <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">{row.payment_mode}</td>
                        <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">{dateStr}</td>
                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">{row.paid_by}</td>
                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">{row.paid_to}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                            row.status === 'Paid'
                              ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-900/50'
                              : 'bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 border border-red-200/50 dark:border-red-900/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${row.status === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`} />
                            {row.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => toast.success(`Viewing invoice for Reference No: ${row.trans_id}`)}
                            className="p-1.5 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl text-slate-400 hover:text-teal-600 transition-all cursor-pointer"
                            title="Invoice Details"
                          >
                            <FileText className="w-4.5 h-4.5" />
                          </button>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenView(row)}
                              className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(row)}
                              className="p-1.5 bg-green-50 dark:bg-green-950/40 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-xl transition-colors cursor-pointer"
                              title="Edit Record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(row.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors cursor-pointer"
                              title="Delete Record"
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

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} Entries
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                  className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTER MODAL */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0 cursor-default" onClick={() => setIsFilterModalOpen(false)} />

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-6 w-full max-w-lg relative flex flex-col animate-in zoom-in-95 duration-200 z-10">
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-5">
              {/* Date Ranges */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5">From</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5">To</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Mode and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5">Payment Mode</label>
                  <select
                    value={filters.payment_mode}
                    onChange={e => setFilters(prev => ({ ...prev, payment_mode: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="">Select an option</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="RTGS">RTGS</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5">Expenses Category</label>
                  <select
                    value={filters.category}
                    onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="">Select an option</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Paid By and Paid To */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1.5">Paid By</label>
                  <select
                    value={filters.paid_by}
                    onChange={e => setFilters(prev => ({ ...prev, paid_by: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="">Select an option</option>
                    {STAFF_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1.5">Paid To</label>
                  <select
                    value={filters.paid_to}
                    onChange={e => setFilters(prev => ({ ...prev, paid_to: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="">Select an option</option>
                    {parties.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-600/10 cursor-pointer"
              >
                Filter
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-8 py-2.5 border border-teal-600 hover:bg-teal-55 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXPENSE RECORD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0 cursor-default" onClick={() => setIsAddModalOpen(false)} />

          <form
            onSubmit={handleAddSubmit}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-6 w-full max-w-2xl relative flex flex-col animate-in zoom-in-95 duration-200 z-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Add Expenses</h3>

            <div className="flex flex-col gap-6">
              {/* Section 1: Expenses Details */}
              <div>
                <h4 className="text-sm font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Expenses Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Expense Category *</label>
                    <select
                      required
                      value={addForm.expense_category}
                      onChange={e => setAddForm(prev => ({ ...prev, expense_category: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="">Select a Type</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Reference No.</label>
                    <input
                      type="text"
                      placeholder="Enter Reference No."
                      value={addForm.trans_id}
                      onChange={e => setAddForm(prev => ({ ...prev, trans_id: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Expense Date *</label>
                    <input
                      type="date"
                      required
                      value={addForm.expense_date}
                      onChange={e => setAddForm(prev => ({ ...prev, expense_date: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Details */}
              <div>
                <h4 className="text-sm font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Payment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Payment Mode *</label>
                    <select
                      required
                      value={addForm.payment_mode}
                      onChange={e => setAddForm(prev => ({ ...prev, payment_mode: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="">Select an Option</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="RTGS">RTGS</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Total Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="Enter Amount"
                      value={addForm.amount}
                      onChange={e => setAddForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Transaction ID</label>
                    <input
                      type="text"
                      placeholder="Enter Transaction ID"
                      value={addForm.payment_account} // mapper field
                      onChange={e => setAddForm(prev => ({ ...prev, payment_account: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Paid by (Staffs) *</label>
                    <select
                      required
                      value={addForm.paid_by}
                      onChange={e => setAddForm(prev => ({ ...prev, paid_by: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="">Select an Option</option>
                      {STAFF_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Paid To (Expense Parties) *</label>
                    <select
                      required
                      value={addForm.paid_to}
                      onChange={e => setAddForm(prev => ({ ...prev, paid_to: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="">Select an Option</option>
                      {parties.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Received By</label>
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={addForm.received_by}
                      onChange={e => setAddForm(prev => ({ ...prev, received_by: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Approved By</label>
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={addForm.approved_by}
                      onChange={e => setAddForm(prev => ({ ...prev, approved_by: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Status</label>
                    <select
                      value={addForm.status}
                      onChange={e => setAddForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Photo</label>
                  <div className="flex items-center justify-between px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-400">
                    <span className="text-sm font-medium text-slate-555">Upload a photo</span>
                    <button type="button" onClick={() => toast.info('Receipt upload capability')} className="p-1 text-teal-600 hover:text-teal-750">
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end gap-3 mt-8 border-t border-slate-100 dark:border-slate-700 pt-4">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2 border border-slate-200 dark:border-slate-750 text-slate-605 dark:text-slate-305 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAdd}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-750 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-600/10 disabled:opacity-50"
              >
                {submittingAdd && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT EXPENSE RECORD MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0 cursor-default" onClick={() => { setIsEditModalOpen(false); setEditingRecordId(null); }} />

          <form
            onSubmit={handleEditSubmit}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-6 w-full max-w-2xl relative flex flex-col animate-in zoom-in-95 duration-200 z-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => { setIsEditModalOpen(false); setEditingRecordId(null); }}
              className="absolute top-4 right-4 p-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Edit Expenses</h3>

            <div className="flex flex-col gap-6">
              {/* Section 1: Expenses Details */}
              <div>
                <h4 className="text-sm font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Expenses Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Expense Category *</label>
                    <select
                      required
                      value={editForm.expense_category}
                      onChange={e => setEditForm(prev => ({ ...prev, expense_category: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="">Select a Type</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Reference No.</label>
                    <input
                      type="text"
                      placeholder="Enter Reference No."
                      value={editForm.trans_id}
                      onChange={e => setEditForm(prev => ({ ...prev, trans_id: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Expense Date *</label>
                    <input
                      type="date"
                      required
                      value={editForm.expense_date}
                      onChange={e => setEditForm(prev => ({ ...prev, expense_date: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Details */}
              <div>
                <h4 className="text-sm font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Payment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Payment Mode *</label>
                    <select
                      required
                      value={editForm.payment_mode}
                      onChange={e => setEditForm(prev => ({ ...prev, payment_mode: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="">Select an Option</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="RTGS">RTGS</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Total Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="Enter Amount"
                      value={editForm.amount}
                      onChange={e => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Transaction ID</label>
                    <input
                      type="text"
                      placeholder="Enter Transaction ID"
                      value={editForm.payment_account}
                      onChange={e => setEditForm(prev => ({ ...prev, payment_account: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Paid by (Staffs) *</label>
                    <select
                      required
                      value={editForm.paid_by}
                      onChange={e => setEditForm(prev => ({ ...prev, paid_by: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="">Select an Option</option>
                      {STAFF_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Paid To (Expense Parties) *</label>
                    <select
                      required
                      value={editForm.paid_to}
                      onChange={e => setEditForm(prev => ({ ...prev, paid_to: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="">Select an Option</option>
                      {parties.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Received By</label>
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={editForm.received_by}
                      onChange={e => setEditForm(prev => ({ ...prev, received_by: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Approved By</label>
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={editForm.approved_by}
                      onChange={e => setEditForm(prev => ({ ...prev, approved_by: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Status</label>
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Photo</label>
                  <div className="flex items-center justify-between px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-400">
                    <span className="text-sm font-medium text-slate-500">Upload a photo</span>
                    <button type="button" onClick={() => toast.info('Receipt upload capability')} className="p-1 text-teal-600 hover:text-teal-700">
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end gap-3 mt-8 border-t border-slate-100 dark:border-slate-700 pt-4">
              <button
                type="button"
                onClick={() => { setIsEditModalOpen(false); setEditingRecordId(null); }}
                className="px-6 py-2 border border-slate-200 dark:border-slate-750 text-slate-605 dark:text-slate-305 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingEdit}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-750 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-600/10 disabled:opacity-50"
              >
                {submittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW EXPENSE RECORD DETAILS MODAL */}
      {isViewModalOpen && viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0 cursor-default" onClick={() => { setIsViewModalOpen(false); setViewingRecord(null); }} />

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-6 w-full max-w-lg relative flex flex-col animate-in zoom-in-95 duration-200 z-10 max-h-[90vh] overflow-y-auto font-sans">
            <button
              onClick={() => { setIsViewModalOpen(false); setViewingRecord(null); }}
              className="absolute top-4 right-4 p-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Transaction Details</h3>
                <p className="text-xs text-slate-550 dark:text-slate-400">Reference No: {viewingRecord.trans_id || 'N/A'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Section 1: Expenses Details */}
              <div>
                <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-1 mb-3">Expenses Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Expense Category</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" /> {viewingRecord.expense_category}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Expense Date</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(viewingRecord.expense_date).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Details */}
              <div>
                <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-1 mb-3">Payment Details</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Payment Mode</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" /> {viewingRecord.payment_mode}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Total Amount</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      ₹{Number(viewingRecord.amount).toLocaleString('en-IN')}/-
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Paid By</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {viewingRecord.paid_by}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Paid To</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {viewingRecord.paid_to}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Received By</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {viewingRecord.received_by || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Approved By</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {viewingRecord.approved_by || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      viewingRecord.status === 'Paid'
                        ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400'
                    }`}>
                      {viewingRecord.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attachment */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Photo</span>
                <div className="border border-slate-100 dark:border-slate-700/60 rounded-xl p-3 bg-slate-50 dark:bg-slate-900/40 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                  No photo/receipt uploaded.
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center gap-3">
              <button
                onClick={() => { setIsViewModalOpen(false); setViewingRecord(null); }}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer text-center"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Expense Record"
        description="Are you sure you want to delete this expense record? This action cannot be undone."
      />
    </AdminLayout>
  )
}

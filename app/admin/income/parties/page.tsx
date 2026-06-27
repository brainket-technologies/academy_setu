'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Loader2, Trash2, Edit3, Users,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface Party {
  id: string
  name: string
  mobile_no: string
  email: string
  party_category: string
  contact_person: string
  amount: string | number
  gst_no: string
  address: string
  created_at: string
}

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [partyCategory, setPartyCategory] = useState('Income')
  const [name, setName] = useState('')
  const [gstNo, setGstNo] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [email, setEmail] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Filter State
  const [filterCategory, setFilterCategory] = useState('')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchParties = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCategory) params.append('party_category', filterCategory)

      const res = await fetch(`/api/admin/income/parties?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setParties(data.data)
        setCurrentPage(1)
      } else {
        toast.error('Failed to load parties')
      }
    } catch {
      toast.error('Error loading parties')
    } finally {
      setLoading(false)
    }
  }, [filterCategory])

  useEffect(() => {
    fetchParties()
  }, [fetchParties])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Party name is required')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId ? `/api/admin/income/parties/${editingId}` : '/api/admin/income/parties'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile_no: mobileNo.trim(),
          email: email.trim(),
          party_category: partyCategory,
          contact_person: contactPerson.trim(),
          amount: amount ? parseFloat(amount) : 0,
          gst_no: gstNo.trim(),
          address: address.trim()
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Party updated successfully' : 'Party created successfully')
        setName('')
        setContactPerson('')
        setAmount('')
        setMobileNo('')
        setEmail('')
        setGstNo('')
        setAddress('')
        setPartyCategory('Income')
        setEditingId(null)
        fetchParties()
      } else {
        toast.error(data.error || 'Failed to save party')
      }
    } catch {
      toast.error('Error saving party')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartEdit = (p: Party) => {
    setEditingId(p.id)
    setName(p.name)
    setContactPerson(p.contact_person || '')
    setAmount(String(p.amount))
    setMobileNo(p.mobile_no || '')
    setEmail(p.email || '')
    setGstNo(p.gst_no || '')
    setAddress(p.address || '')
    setPartyCategory(p.party_category || 'Income')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName('')
    setContactPerson('')
    setAmount('')
    setMobileNo('')
    setEmail('')
    setGstNo('')
    setAddress('')
    setPartyCategory('Income')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/income/parties/${deleteTargetId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Party deleted successfully')
        setDeleteTargetId(null)
        if (deleteTargetId === editingId) {
          handleCancelEdit()
        }
        fetchParties()
      } else {
        toast.error(data.error || 'Failed to delete party')
      }
    } catch {
      toast.error('Error deleting party')
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

  // Pagination slice
  const totalCount = parties.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedParties = parties.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create Parties</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure income and expense parties/contacts for tracking payments.</p>
        </div>

        {/* Top: Form to Add/Edit Party (Full Width Card) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" /> {editingId ? 'Edit Party' : 'Add Party'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 3-Column Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 font-medium">Party Category *</label>
                <select
                  required
                  value={partyCategory}
                  onChange={e => setPartyCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium cursor-pointer"
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 font-medium">Party Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter a Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1.5 font-medium">GST No.</label>
                <input
                  type="text"
                  placeholder="Enter GST No."
                  value={gstNo}
                  onChange={e => setGstNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1.5 font-medium">Party Mobile No.</label>
                <input
                  type="tel"
                  placeholder="Enter Mobile No."
                  value={mobileNo}
                  onChange={e => setMobileNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1.5 font-medium">Party Email</label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1.5 font-medium">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="Enter Contact Person name"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                />
              </div>
            </div>

            {/* Row 3 layout: Address spanning 2 cols, Amount spanning 1 col */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1.5 font-medium">Address</label>
                <input
                  type="text"
                  placeholder="Enter Address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1.5 font-medium">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                />
              </div>
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

        {/* Bottom: List Table & Filtering */}
        <div className="flex flex-col gap-4">
          {/* Party Category Filter Select */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm p-5 flex flex-col gap-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-0.5 font-medium">Party Category</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-48 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium cursor-pointer"
            >
              <option value="">Select an Option</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          {/* List Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="py-4 px-6">S.No.</th>
                    <th className="py-4 px-6">Party Category</th>
                    <th className="py-4 px-6">Party Name</th>
                    <th className="py-4 px-6">Contact Person Name</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Mobile No.</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">GST No.</th>
                    <th className="py-4 px-6">Created At</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-600 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                          <span className="text-xs font-medium text-slate-400">Loading parties...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedParties.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No parties found.
                      </td>
                    </tr>
                  ) : (
                    paginatedParties.map((row, idx) => {
                      const rowNum = (currentPage - 1) * pageSize + idx + 1
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6 font-medium text-slate-400">{rowNum}</td>
                          <td className="py-4 px-6 font-semibold text-slate-750 dark:text-slate-350">{row.party_category}</td>
                          <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                          <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">{row.contact_person || '-'}</td>
                          <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100">{Number(row.amount) > 0 ? `${Number(row.amount).toLocaleString('en-IN')}/-` : '0/-'}</td>
                          <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">{row.mobile_no || '-'}</td>
                          <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">{row.email || '-'}</td>
                          <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">{row.gst_no || '-'}</td>
                          <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">{formatDateTime(row.created_at)}</td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleStartEdit(row)}
                                className="p-1.5 bg-green-55 dark:bg-green-950/40 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-xl transition-colors cursor-pointer"
                                title="Edit Party"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTargetId(row.id)}
                                className="p-1.5 bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors cursor-pointer"
                                title="Delete Party"
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
                  <span className="px-3 py-1 bg-teal-600 text-white border border-teal-600 rounded-lg text-xs font-bold">
                    {currentPage}
                  </span>
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
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Party / Contact"
        description="Are you sure you want to delete this party? Any transactions linked to it will keep their received_from reference but this party will be deleted."
      />
    </AdminLayout>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Search, Plus, Filter, Edit3, Trash2, Loader2, 
  ChevronLeft, ChevronRight, X, Paperclip, AlertCircle 
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

const STAFF_LIST = ['Riya', 'Amit', 'Amit B', 'Ankit', 'Priya', 'Rahul']

interface Ticket {
  id: string
  ticket_no: string
  assigned_to: string
  segment: string
  school_name: string
  ticket_category: string
  sub_category: string
  priority: 'Low' | 'Medium' | 'High'
  complainer_name: string
  complainer_mobile: string
  description: string
  image_attachment: string
  status: 'Pending' | 'Requested' | 'Completed'
  created_at: string
}

interface Segment {
  id: string
  name: string
}

interface Application {
  id: string
  school_name: string
}

interface StatusCounts {
  all: number
  pending: number
  requested: number
  completed: number
}

// Helpers for status conversions
// DB status: Pending, Requested, Completed
// Form status: Created, Working, Issue Resolve
const dbToFormStatus = (status: string) => {
  if (status === 'Pending') return 'Created'
  if (status === 'Requested') return 'Working'
  if (status === 'Completed') return 'Issue Resolve'
  return status
}

const formToDbStatus = (status: string) => {
  if (status === 'Created') return 'Pending'
  if (status === 'Working') return 'Requested'
  if (status === 'Issue Resolve') return 'Completed'
  return status
}

export default function AllTicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Status Filter Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'Pending' | 'Requested' | 'Completed'>('all')
  const [counts, setCounts] = useState<StatusCounts>({ all: 0, pending: 0, requested: 0, completed: 0 })

  // Search & Filters state
  const [searchText, setSearchText] = useState('')
  const [filterTicketNo, setFilterTicketNo] = useState('')
  const [filterSegment, setFilterSegment] = useState('')
  const [filterSchoolName, setFilterSchoolName] = useState('')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Reference lists
  const [segments, setSegments] = useState<Segment[]>([])
  const [schools, setSchools] = useState<string[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  // Form states
  const [formSegment, setFormSegment] = useState('')
  const [formSchoolName, setFormSchoolName] = useState('')
  const [isValidated, setIsValidated] = useState(false)
  const [ticketNo, setTicketNo] = useState('')
  const [ticketCategory, setTicketCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low')
  const [complainerName, setComplainerName] = useState('')
  const [complainerMobile, setComplainerMobile] = useState('')
  const [description, setDescription] = useState('')
  const [mockAttachment, setMockAttachment] = useState('')
  const [complaintStatus, setComplaintStatus] = useState('Created')
  const [submitting, setSubmitting] = useState(false)

  // Delete modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchTickets = useCallback(async (page = 1, search = '', status = '', seg = '', sName = '', tNo = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      })
      if (search) params.append('search', search)
      if (status && status !== 'all') params.append('status', status)
      if (seg) params.append('segment', seg)
      if (sName) params.append('school', sName) // We will handle search matches
      if (tNo) params.append('ticket_no', tNo) // Handled on backend search, let's append as search if not specifically handled

      // Adjust route search mapping
      let searchParam = search
      if (tNo) {
        searchParam = tNo
      } else if (sName) {
        searchParam = sName
      }
      if (searchParam) {
        params.set('search', searchParam)
      }

      const res = await fetch(`/api/admin/ticket?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setTickets(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
        if (data.meta.counts) {
          setCounts(data.meta.counts)
        }
      } else {
        toast.error('Failed to fetch tickets')
      }
    } catch {
      toast.error('Error occurred loading tickets')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadReferenceData = useCallback(async () => {
    try {
      // 1. Load segments
      const segRes = await fetch('/api/admin/segment')
      const segData = await segRes.json()
      if (segData.success) setSegments(segData.data)

      // 2. Load school names from applications
      const appRes = await fetch('/api/admin/application')
      const appData = await appRes.json()
      if (appData.success) {
        const uniqueSchools = Array.from(
          new Set(appData.data.map((app: Application) => app.school_name))
        ) as string[]
        setSchools(uniqueSchools)
      }

      // 3. Load ticket categories
      const catRes = await fetch('/api/admin/ticket-category')
      const catData = await catRes.json()
      if (catData.success) setCategories(catData.data)
    } catch (e) {
      console.error('Failed to load validation reference data', e)
    }
  }, [])

  useEffect(() => {
    fetchTickets(1, searchText, activeTab)
    loadReferenceData()
  }, [fetchTickets, activeTab, loadReferenceData])

  // Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTickets(1, searchText, activeTab, filterSegment, filterSchoolName, filterTicketNo)
  }

  // Filter Modal triggers
  const handleApplyFilters = () => {
    setIsFilterModalOpen(false)
    fetchTickets(1, searchText, activeTab, filterSegment, filterSchoolName, filterTicketNo)
  }

  const handleClearFilters = () => {
    setFilterTicketNo('')
    setFilterSegment('')
    setFilterSchoolName('')
    setSearchText('')
    setIsFilterModalOpen(false)
    fetchTickets(1, '', activeTab, '', '', '')
  }

  // Assign staff change triggers immediate DB update
  const handleAssignStaffChange = async (ticketId: string, staffName: string) => {
    try {
      const res = await fetch(`/api/admin/ticket/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: staffName })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Ticket assigned to ${staffName || 'None'}`)
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assigned_to: staffName } : t))
      } else {
        toast.error(data.error || 'Failed to update assignment')
      }
    } catch {
      toast.error('An error occurred while updating assignment')
    }
  }

  // Form setup triggers
  const handleStartCreate = () => {
    setEditingId(null)
    setFormSegment('')
    setFormSchoolName('')
    setIsValidated(false)
    setTicketNo(`Tick${Math.floor(100000 + Math.random() * 900000)}`)
    setTicketCategory('')
    setSubCategory('')
    setPriority('Low')
    setComplainerName('')
    setComplainerMobile('')
    setDescription('')
    setMockAttachment('')
    setComplaintStatus('Created')
    setView('form')
  }

  const handleStartEdit = (ticket: Ticket) => {
    setEditingId(ticket.id)
    setFormSegment(ticket.segment)
    setFormSchoolName(ticket.school_name)
    setIsValidated(true) // already validated segment & school
    setTicketNo(ticket.ticket_no)
    setTicketCategory(ticket.ticket_category)
    setSubCategory(ticket.sub_category || '')
    setPriority(ticket.priority || 'Low')
    setComplainerName(ticket.complainer_name || '')
    setComplainerMobile(ticket.complainer_mobile || '')
    setDescription(ticket.description || '')
    setMockAttachment(ticket.image_attachment || '')
    setComplaintStatus(dbToFormStatus(ticket.status))
    setView('form')
  }

  const handleValidateSegmentSchool = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formSegment) {
      toast.error('Please select a Segment')
      return
    }
    if (!formSchoolName) {
      toast.error('Please select a School')
      return
    }
    setIsValidated(true)
    toast.success('Segment & School validated successfully. Complete details below.')
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketCategory) {
      toast.error('Ticket Category is required')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId ? `/api/admin/ticket/${editingId}` : '/api/admin/ticket'
      const method = editingId ? 'PUT' : 'POST'
      
      const payload = {
        segment: formSegment,
        school_name: formSchoolName,
        ticket_no: ticketNo,
        ticket_category: ticketCategory,
        sub_category: subCategory,
        priority,
        complainer_name: complainerName,
        complainer_mobile: complainerMobile,
        description,
        image_attachment: mockAttachment,
        status: formToDbStatus(complaintStatus)
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success(editingId ? 'Ticket updated successfully!' : 'Ticket created successfully!')
        setView('list')
        fetchTickets(currentPage, searchText, activeTab)
      } else {
        toast.error(data.error || 'Failed to submit ticket')
      }
    } catch {
      toast.error('Something went wrong submitting ticket')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/ticket/${deleteTargetId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Ticket deleted successfully')
        fetchTickets(currentPage, searchText, activeTab)
      } else {
        toast.error(data.error || 'Failed to delete ticket')
      }
    } catch {
      toast.error('Error occurred deleting ticket')
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
    }
  }

  // File Mock Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMockAttachment(e.target.files[0].name)
      toast.success(`Attached: ${e.target.files[0].name}`)
    }
  }

  // Pagination helper
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, totalCount)

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Title / Action Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {view === 'form' ? (editingId ? 'Edit Ticket' : 'Create Ticket') : 'All Ticket'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {view === 'form' 
                ? 'Fill out validation and ticket details inline' 
                : 'View, filter, assign, and manage support tickets'}
            </p>
          </div>
          {view === 'list' && (
            <button
              onClick={handleStartCreate}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-600/10 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Ticket
            </button>
          )}
        </div>

        {/* View Switcher Container */}
        {view === 'form' ? (
          /* Create/Edit Inline View */
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
            {/* Step 1: Segment & School Validation */}
            <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center text-xs">1</span>
                Segment & School Validation
              </h3>
              <form onSubmit={handleValidateSegmentSchool} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Segment</label>
                  <select
                    value={formSegment}
                    onChange={(e) => {
                      setFormSegment(e.target.value)
                      setIsValidated(false)
                    }}
                    disabled={editingId !== null}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 dark:text-slate-200"
                    required
                  >
                    <option value="">Select Segment</option>
                    {segments.map(seg => (
                      <option key={seg.id} value={seg.name}>{seg.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">School Name</label>
                  <select
                    value={formSchoolName}
                    onChange={(e) => {
                      setFormSchoolName(e.target.value)
                      setIsValidated(false)
                    }}
                    disabled={editingId !== null}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 dark:text-slate-200"
                    required
                  >
                    <option value="">Select School</option>
                    {schools.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={editingId !== null}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                      isValidated 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50' 
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10'
                    }`}
                  >
                    {isValidated ? 'Validated ✓' : 'Validate & Proceed'}
                  </button>
                </div>
              </form>
            </div>

            {/* Step 2: Detailed Ticket Fields (Shown only after validation) */}
            {isValidated && (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 animate-in slide-in-from-top-4 duration-250">
                <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center text-xs">2</span>
                    Ticket Particulars
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Ticket No */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ticket Number</label>
                      <input
                        type="text"
                        value={ticketNo}
                        readOnly
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-mono font-bold text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed"
                      />
                    </div>
                    {/* Ticket Category */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Ticket Category<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Sub Category */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Sub Category</label>
                      <input
                        type="text"
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        placeholder="e.g. Password Reset"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Complainer Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Complainer Name</label>
                    <input
                      type="text"
                      value={complainerName}
                      onChange={(e) => setComplainerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  {/* Complainer Mobile */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Complainer Mobile</label>
                    <input
                      type="tel"
                      value={complainerMobile}
                      onChange={(e) => setComplainerMobile(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  {/* Complaint Status dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Complaint Status</label>
                    <select
                      value={complaintStatus}
                      onChange={(e) => setComplaintStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Created">Created</option>
                      <option value="Working">Working</option>
                      <option value="Issue Resolve">Issue Resolve</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Priority and Condition Banner */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Priority</label>
                      <div className="flex items-center gap-6 mt-1.5">
                        {(['Low', 'Medium', 'High'] as const).map(prio => (
                          <label key={prio} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                            <input
                              type="radio"
                              name="priority"
                              value={prio}
                              checked={priority === prio}
                              onChange={() => setPriority(prio)}
                              className="text-teal-600 focus:ring-teal-500 w-4 h-4"
                            />
                            {prio}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Conditional Banner: Medium or High priority */}
                    {(priority === 'Medium' || priority === 'High') && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400 animate-in fade-in duration-200">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">Your Problem solve within 24 hours.</span>
                      </div>
                    )}
                  </div>

                  {/* Mock Screenshot Attachment */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">Screenshot Attachment</label>
                    <label className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Paperclip className="w-5 h-5 text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                        {mockAttachment ? `Selected: ${mockAttachment}` : 'Attach a screenshot / image'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed description of the support ticket issue..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Action Form Footer */}
                <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700 pt-6 mt-2">
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-600/10 cursor-pointer flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Update Ticket' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* List Dashboard View */
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
            
            {/* Status Counter Tabs Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* All Ticket */}
              <button
                onClick={() => setActiveTab('all')}
                className={`p-4 rounded-2xl flex flex-col gap-1.5 transition-all text-left border relative overflow-hidden cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-600/10'
                    : 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-100 dark:border-violet-900/30 text-violet-750 hover:bg-violet-100/50'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'all' ? 'text-white/80' : 'text-violet-500'}`}>All Ticket</span>
                <span className="text-2xl font-black">{counts.all}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center absolute -right-2 -bottom-2 opacity-10 bg-current`} />
              </button>

              {/* Completed */}
              <button
                onClick={() => setActiveTab('Completed')}
                className={`p-4 rounded-2xl flex flex-col gap-1.5 transition-all text-left border relative overflow-hidden cursor-pointer ${
                  activeTab === 'Completed'
                    ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/10'
                    : 'bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30 text-green-750 hover:bg-green-100/50'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'Completed' ? 'text-white/80' : 'text-green-600'}`}>Completed</span>
                <span className="text-2xl font-black">{counts.completed}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center absolute -right-2 -bottom-2 opacity-10 bg-current`} />
              </button>

              {/* Requested */}
              <button
                onClick={() => setActiveTab('Requested')}
                className={`p-4 rounded-2xl flex flex-col gap-1.5 transition-all text-left border relative overflow-hidden cursor-pointer ${
                  activeTab === 'Requested'
                    ? 'bg-pink-650 border-pink-650 text-white shadow-md shadow-pink-650/10'
                    : 'bg-pink-50/50 dark:bg-pink-950/20 border-pink-100 dark:border-pink-900/30 text-pink-750 hover:bg-pink-100/50'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'Requested' ? 'text-white/80' : 'text-pink-600'}`}>Requested</span>
                <span className="text-2xl font-black">{counts.requested}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center absolute -right-2 -bottom-2 opacity-10 bg-current`} />
              </button>

              {/* Pending */}
              <button
                onClick={() => setActiveTab('Pending')}
                className={`p-4 rounded-2xl flex flex-col gap-1.5 transition-all text-left border relative overflow-hidden cursor-pointer ${
                  activeTab === 'Pending'
                    ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/10'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-750 hover:bg-amber-100/50'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'Pending' ? 'text-white/80' : 'text-amber-650'}`}>Pending</span>
                <span className="text-2xl font-black">{counts.pending}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center absolute -right-2 -bottom-2 opacity-10 bg-current`} />
              </button>
            </div>

            {/* Filter and Search Action bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Ticket / School / Name"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                  />
                </form>
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className={`p-2.5 border rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                    filterTicketNo || filterSegment || filterSchoolName
                      ? 'bg-teal-550 border-teal-550 text-white shadow-sm shadow-teal-550/20'
                      : 'text-slate-550 hover:bg-slate-50 border-slate-200 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                  title="Filter Search Options"
                >
                  <Filter className="w-4 h-4" />
                  { (filterTicketNo || filterSegment || filterSchoolName) && 'Filtered' }
                </button>
              </div>
            </div>

            {/* Data Log Table */}
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-16">S.No.</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Assigned To</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Ticket No.</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Segment</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">School Name</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 max-w-xs">Description</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Status</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                          Loading tickets...
                        </div>
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No support tickets found.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t, idx) => {
                      const sNo = (currentPage - 1) * pageSize + idx + 1
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                          <td className="px-5 py-4">
                            <select
                              value={t.assigned_to || ''}
                              onChange={(e) => handleAssignStaffChange(t.id, e.target.value)}
                              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-750 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                            >
                              <option value="">Assign Staff</option>
                              {STAFF_LIST.map(staff => (
                                <option key={staff} value={staff}>{staff}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-lg text-xs tracking-wider uppercase">
                              {t.ticket_no}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-700 dark:text-slate-300 text-sm font-semibold">{t.segment}</td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold leading-relaxed">{t.school_name}</td>
                          <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium max-w-xs truncate leading-relaxed" title={t.description}>
                            {t.description || '—'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                              t.status === 'Completed'
                                ? 'bg-green-50 dark:bg-green-950/20 text-green-700'
                                : t.status === 'Requested'
                                ? 'bg-pink-50 dark:bg-pink-950/20 text-pink-700'
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {t.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleStartEdit(t)}
                                className="w-7 h-7 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                                title="Edit Ticket"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(t.id)}
                                className="w-7 h-7 flex items-center justify-center bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                                title="Delete Ticket"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Showing {startEntry}-{endEntry} of {totalCount} Entries
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchTickets(1, searchText, activeTab, filterSegment, filterSchoolName, filterTicketNo)}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-350 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {'<<'}
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchTickets(currentPage - 1, searchText, activeTab, filterSegment, filterSchoolName, filterTicketNo)}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-350 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {getPageNumbers().map((pg) => (
                    <button
                      key={pg}
                      onClick={() => fetchTickets(pg, searchText, activeTab, filterSegment, filterSchoolName, filterTicketNo)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        pg === currentPage
                          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25'
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-700'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchTickets(currentPage + 1, searchText, activeTab, filterSegment, filterSchoolName, filterTicketNo)}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-350 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchTickets(totalPages, searchText, activeTab, filterSegment, filterSchoolName, filterTicketNo)}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-350 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {'>>'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Centered Filter Dialog Overlay Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0 cursor-default" onClick={() => setIsFilterModalOpen(false)} />
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-6 w-full max-w-md relative animate-in zoom-in-95 duration-200 z-10 flex flex-col gap-5">
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-650 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3">
              Filter Options
            </h3>
            
            <div className="flex flex-col gap-4">
              {/* Ticket No Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ticket Number</label>
                <input
                  type="text"
                  placeholder="e.g. Tick12345"
                  value={filterTicketNo}
                  onChange={(e) => setFilterTicketNo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Segment Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Segment</label>
                <select
                  value={filterSegment}
                  onChange={(e) => setFilterSegment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="">All Segments</option>
                  {segments.map(seg => (
                    <option key={seg.id} value={seg.name}>{seg.name}</option>
                  ))}
                </select>
              </div>

              {/* School Name input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">School Name</label>
                <input
                  type="text"
                  placeholder="e.g. abcdschool"
                  value={filterSchoolName}
                  onChange={(e) => setFilterSchoolName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
              <button
                onClick={handleClearFilters}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer text-center"
              >
                Clear Filters
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all cursor-pointer text-center shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Ticket Confirmation */}
      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Support Ticket"
        description="Are you sure you want to delete this support ticket? This action is permanent and cannot be undone."
      />
    </AdminLayout>
  )
}

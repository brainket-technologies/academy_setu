'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ManagerLayout } from '@/components/layout/ManagerLayout'
import { 
  Search, Edit3, Trash2, Calendar, Clock, Loader2, 
  ChevronLeft, ChevronRight, Share2, Upload, Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

const STAFF_LIST = ['Riya', 'Amit', 'Amit B', 'Ankit', 'Priya', 'Rahul']
const SOURCE_OPTIONS = ['Offline Meeting', 'YouTube', 'Facebook', 'Other']
const STATE_OPTIONS = ['Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Delhi', 'Maharashtra', 'Bihar', 'Haryana']
const DISTRICT_OPTIONS = ['Lucknow', 'Bhopal', 'Chandigarh', 'New Delhi', 'Mumbai', 'Patna', 'Gurugram', 'Noida']

interface Lead {
  id: string
  lead_source: string
  mobile_no: string
  email_id: string
  contact_person: string
  school_name: string
  state: string
  district: string
  no_of_students: number
  status: string
  assigned_to: string
  created_at: string
  updated_at: string
  latest_remarks?: string
  latest_follow_up?: string
}

interface LeadStatus {
  id: string
  name: string
  text_color: string
  bg_color: string
  show_on_bdm: boolean
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [statuses, setStatuses] = useState<LeadStatus[]>([])

  // Search & Filter
  const [searchText, setSearchText] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  
  // Modal Loading States
  const [isSaving, setIsSaving] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Add/Edit Form State
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [leadHistory, setLeadHistory] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  
  // Base Lead Add Form Data
  const [formData, setFormData] = useState({
    leadSource: '',
    mobileNo: '',
    emailId: '',
    contactPerson: '',
    schoolName: '',
    state: '',
    district: '',
    noOfStudents: '',
    status: 'Created'
  })

  // Update Lead Log Form Data (for edit modal)
  const [communicationOption, setCommunicationOption] = useState<'Call' | 'Message'>('Call')
  const [remarks, setRemarks] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [submittingUpdate, setSubmittingUpdate] = useState(false)

  const fetchLeads = useCallback(async (page = 1, search = '', src = '', stat = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      })
      if (search) params.append('search', search)
      if (src) params.append('source', src)
      if (stat) params.append('status', stat)

      const res = await fetch(`/api/admin/crm/leads?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setLeads(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error('Failed to load leads')
      }
    } catch {
      toast.error('Error occurred loading leads')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/crm/status')
      const data = await res.json()
      if (data.success) {
        setStatuses(data.data)
      }
    } catch {
      console.error('Failed to load statuses')
    }
  }, [])

  useEffect(() => {
    fetchLeads(1, searchText, filterSource, filterStatus)
    fetchStatuses()
  }, [fetchLeads, fetchStatuses])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLeads(1, searchText, filterSource, filterStatus)
  }

  // --- Handlers for Add/Edit/Delete Modals ---

  const openAddModal = () => {
    setFormData({
      leadSource: '',
      mobileNo: '',
      emailId: '',
      contactPerson: '',
      schoolName: '',
      state: '',
      district: '',
      noOfStudents: '',
      status: 'Created'
    })
    setIsAddModalOpen(true)
  }

  const openEditModal = async (lead: Lead) => {
    setEditingLead(lead)
    setIsEditModalOpen(true)
    setLoadingDetails(true)
    setCommunicationOption('Call')
    setRemarks('')
    setFollowUpDate('')
    setEditStatus(lead.status || '')
    
    try {
      const res = await fetch(`/api/admin/crm/leads/${lead.id}`)
      const data = await res.json()
      if (data.success) {
        setEditingLead(data.data)
        setLeadHistory(data.data.history || [])
      }
    } catch {
      toast.error('Failed to load lead timeline details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleUpdateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLead) return
    if (!remarks.trim() || !followUpDate || !editStatus) {
      toast.error('Please fill required fields (Remarks, Follow Up Date, Status)')
      return
    }

    setSubmittingUpdate(true)
    try {
      const res = await fetch(`/api/admin/crm/leads/${editingLead.id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communication_option: communicationOption,
          call_duration: '', // Removed duration based on mockup
          remarks: remarks.trim(),
          follow_up_date: followUpDate,
          status: editStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Lead updated successfully!')
        
        // Refresh details & history
        const detailRes = await fetch(`/api/admin/crm/leads/${editingLead.id}`)
        const detailData = await detailRes.json()
        if (detailData.success) {
          setEditingLead(detailData.data)
          setLeadHistory(detailData.data.history || [])
        }

        // Reset form
        setRemarks('')
        setFollowUpDate('')
        
        // Refresh main list
        fetchLeads(currentPage, searchText, filterSource, filterStatus)
      } else {
        toast.error(data.error || 'Failed to submit update')
      }
    } catch {
      toast.error('Something went wrong submitting update')
    } finally {
      setSubmittingUpdate(false)
    }
  }

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.leadSource || !formData.mobileNo.trim() || !formData.schoolName.trim() || !formData.status) {
      toast.error('Please fill required fields (Source, Mobile, School, Status)')
      return
    }

    setIsSaving(true)
    const url = '/api/admin/crm/leads'
    const method = 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_source: formData.leadSource,
          mobile_no: formData.mobileNo.trim(),
          email_id: formData.emailId.trim(),
          contact_person: formData.contactPerson.trim(),
          school_name: formData.schoolName.trim(),
          state: formData.state,
          district: formData.district,
          no_of_students: parseInt(formData.noOfStudents || '0'),
          status: formData.status
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Lead created successfully!')
        setIsAddModalOpen(false)
        fetchLeads(currentPage, searchText, filterSource, filterStatus)
      } else {
        toast.error(data.error || 'Failed to create lead')
      }
    } catch {
      toast.error('Error occurred while creating lead')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/crm/leads/${deleteTargetId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Lead deleted successfully')
        fetchLeads(currentPage, searchText, filterSource, filterStatus)
      } else {
        toast.error(data.error || 'Failed to delete lead')
      }
    } catch {
      toast.error('Error occurred deleting lead')
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
    }
  }

  // Helper date parsing
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      return { date, time }
    } catch {
      return { date: dateStr, time: '' }
    }
  }

  const renderStatusBadge = (statusName: string) => {
    const matched = statuses.find(s => s.name.toLowerCase() === statusName.toLowerCase())
    if (matched) {
      return (
        <span 
          className="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
          style={{ color: matched.text_color, backgroundColor: matched.bg_color }}
        >
          {statusName}
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
        {statusName}
      </span>
    )
  }

  // Pagination bounds
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
    <ManagerLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 md:p-6">
        {/* Title Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-6 md:px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">
              All Leads
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Monitor and manage your sales leads pipeline
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/10 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>

        {/* List Leads Log View */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
          
          {/* Filter controls row */}
          <div className="flex items-center justify-between flex-wrap gap-5">
            <div className="flex items-center flex-wrap gap-4 flex-1">
              {/* Lead Source Filter */}
              <div className="flex flex-col gap-1 shrink-0 w-full sm:w-44">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead Source</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="">All Sources</option>
                  {SOURCE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col gap-1 shrink-0 w-full sm:w-44">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  {statuses.map(st => (
                    <option key={st.id} value={st.name}>{st.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
              </form>
            </div>
          </div>

          {/* Desktop Leads Log Table */}
          <div className="hidden md:block overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl mt-2">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-blue-50/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-16">S. No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">School Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Mobile No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Source</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Updated At</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Status</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        Loading leads...
                      </div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No leads found matching filters.
                    </td>
                  </tr>
                ) : (
                  leads.map((l, idx) => {
                    const sNo = (currentPage - 1) * pageSize + idx + 1
                    const { date: uDate, time: uTime } = formatDateTime(l.updated_at)
                    return (
                      <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-550 dark:text-slate-400">{sNo}.</td>
                        <td className="px-5 py-4 text-slate-800 dark:text-slate-100 font-semibold">{l.school_name}</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-205 text-sm font-semibold">
                          {l.contact_person}
                        </td>
                        <td className="px-5 py-4 text-slate-650 dark:text-slate-300 text-sm font-semibold">{l.mobile_no}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">{l.lead_source}</td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            {uDate}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            {uTime}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {renderStatusBadge(l.status)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(l)}
                              className="w-7 h-7 flex items-center justify-center bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                              title="Edit Lead"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(l.id)}
                              className="w-7 h-7 flex items-center justify-center bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-550 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete Lead"
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

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-4 bg-slate-50/50 dark:bg-slate-900/10 -mx-4 p-4 mt-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                <span className="text-xs font-semibold mt-2 block">Loading leads...</span>
              </div>
            ) : leads.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No leads found matching filters.
              </div>
            ) : (
              leads.map((l, idx) => {
                const sNo = (currentPage - 1) * pageSize + idx + 1
                return (
                  <div 
                    key={l.id} 
                    className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{sNo} Lead • {l.lead_source}</span>
                        <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-0.5">{l.school_name}</h4>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(l)}
                          className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl cursor-pointer"
                          title="Edit Lead"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(l.id)}
                          className="p-2 bg-red-50 dark:bg-red-950/30 text-red-550 dark:text-red-400 rounded-xl cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Contact</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{l.contact_person}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Mobile</span>
                        <span>{l.mobile_no}</span>
                      </div>
                      <div className="mt-1 col-span-2">
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email</span>
                        <span className="block truncate">{l.email_id || '—'}</span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center gap-2">
                      <div className="flex flex-col gap-1 w-full sm:w-auto">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                         {renderStatusBadge(l.status)}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
              <p className="text-xs font-semibold text-slate-550 dark:text-slate-400">
                Showing {startEntry}-{endEntry} of {totalCount} Entries
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchLeads(1, searchText, filterSource, filterStatus)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:text-slate-305 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'<<'}
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchLeads(currentPage - 1, searchText, filterSource, filterStatus)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:text-slate-305 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((pg) => (
                  <button
                    key={pg}
                    onClick={() => fetchLeads(pg, searchText, filterSource, filterStatus)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      pg === currentPage
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchLeads(currentPage + 1, searchText, filterSource, filterStatus)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:text-slate-305 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchLeads(totalPages, searchText, filterSource, filterStatus)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:text-slate-355 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'>>'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Lead confirmation */}
      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
      />

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Add New Lead
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="lead-form" onSubmit={handleSaveLead} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                      Lead Source<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.leadSource}
                      onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                      required
                    >
                      <option value="">Select an Option</option>
                      {SOURCE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                      Mobile No.<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Mobile No."
                      value={formData.mobileNo}
                      onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Email Id</label>
                    <input
                      type="email"
                      placeholder="Enter Email ID"
                      value={formData.emailId}
                      onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Contact Person</label>
                    <input
                      type="text"
                      placeholder="Enter Contact Person"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                      School Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter School Name"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">No. of Students</label>
                    <input
                      type="number"
                      placeholder="Enter No. of Students"
                      value={formData.noOfStudents}
                      onChange={(e) => setFormData({ ...formData, noOfStudents: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select State</option>
                      {STATE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">District</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select District</option>
                      {DISTRICT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 md:w-1/2">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                    Status<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                    required
                  >
                    <option value="">Select Status</option>
                    {statuses.map(st => (
                      <option key={st.id} value={st.name}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-755 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                form="lead-form"
                type="submit"
                disabled={isSaving}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/10 cursor-pointer flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal (with History) */}
      {isEditModalOpen && editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Edit Lead
              </h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingLead(null)
                  setLeadHistory([])
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8 bg-slate-50/30 dark:bg-slate-900/20">
              
              {/* Section 1: Lead Details (Read-only) */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Lead Details</h3>
                  <div className="h-px w-full bg-slate-300 dark:bg-slate-700" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Lead Source</label>
                    <div className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-500 font-semibold">{editingLead.lead_source}</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">School Name</label>
                    <div className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-500 font-semibold">{editingLead.school_name}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Contact Person</label>
                    <div className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-500 font-semibold">{editingLead.contact_person || '—'}</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mobile No.</label>
                    <div className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-500 font-semibold">{editingLead.mobile_no}</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Id</label>
                    <div className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-500 font-semibold">{editingLead.email_id || '—'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">State</label>
                    <div className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-500 font-semibold">{editingLead.state || '—'}</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">District</label>
                    <div className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-500 font-semibold">{editingLead.district || '—'}</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">No. of Students</label>
                    <div className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-500 font-semibold">{editingLead.no_of_students || 0}</div>
                  </div>
                </div>
              </div>

              {/* Section 2: Update Lead */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Update Lead</h3>
                  <div className="h-px w-full bg-slate-300 dark:bg-slate-700" />
                </div>
                <form onSubmit={handleUpdateFollowUp} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Communication Option</label>
                    <div className="flex items-center gap-6">
                      {(['Call', 'Message'] as const).map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-semibold">
                          <input
                            type="radio"
                            name="comm_option"
                            value={opt}
                            checked={communicationOption === opt}
                            onChange={() => setCommunicationOption(opt)}
                            className="text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Remarks</label>
                    <input
                      type="text"
                      placeholder="Enter Remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Follow Up Date</label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                        required
                      >
                        <option value="">Select Status</option>
                        {statuses.map(st => (
                          <option key={st.id} value={st.name}>{st.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false)
                        setEditingLead(null)
                        setLeadHistory([])
                      }}
                      className="px-8 py-2.5 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer w-32"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingUpdate}
                      className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-md shadow-blue-600/10 cursor-pointer flex items-center justify-center gap-2 w-32"
                    >
                      {submittingUpdate && <Loader2 className="w-4 h-4 animate-spin" />}
                      Update
                    </button>
                  </div>
                </form>
              </div>

              {/* Section 3: Lead History */}
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Lead History</h3>
                  <div className="h-px w-full bg-slate-300 dark:bg-slate-700" />
                </div>
                
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-blue-50/60 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 w-12">S. No.</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">School Name</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Address</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Mobile No.</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Lead Source</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Remarks</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Created At</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Updated At</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {loadingDetails ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              Loading history...
                            </div>
                          </td>
                        </tr>
                      ) : leadHistory.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                            No history entries found.
                          </td>
                        </tr>
                      ) : (
                        leadHistory.map((hist, idx) => {
                          const { date: cDate, time: cTime } = formatDateTime(hist.created_at)
                          const { date: uDate, time: uTime } = formatDateTime(editingLead.updated_at)
                          return (
                            <tr key={hist.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-500">{idx + 1}.</td>
                              <td className="px-4 py-3 text-slate-700 font-medium">{editingLead.school_name}</td>
                              <td className="px-4 py-3 text-slate-600">
                                {editingLead.district ? `${editingLead.district}, ` : ''}{editingLead.state}
                              </td>
                              <td className="px-4 py-3 text-slate-600 font-medium">{editingLead.mobile_no}</td>
                              <td className="px-4 py-3 text-slate-600">{editingLead.lead_source}</td>
                              <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate" title={hist.remarks}>{hist.remarks || '—'}</td>
                              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                <div className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{cDate}</div>
                                <div className="flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3"/>{cTime}</div>
                              </td>
                              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                <div className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{uDate}</div>
                                <div className="flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3"/>{uTime}</div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {renderStatusBadge(hist.status)}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  )
}

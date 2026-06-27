'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Search, Edit3, Trash2, Calendar, Clock, Loader2, 
  ChevronLeft, ChevronRight, Share2, Upload, AlertCircle 
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

const STAFF_LIST = ['Riya', 'Amit', 'Amit B', 'Ankit', 'Priya', 'Rahul']
const SOURCE_OPTIONS = ['Offline Meeting', 'YouTube', 'Facebook', 'Other']

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

interface LeadHistory {
  id: string
  lead_id: string
  communication_option: 'Call' | 'Message'
  call_duration: string
  remarks: string
  follow_up_date: string | null
  status: string
  created_at: string
}

interface LeadStatus {
  id: string
  name: string
  text_color: string
  bg_color: string
  show_on_bdm: boolean
}

export default function AllLeadsPage() {
  const [view, setView] = useState<'list' | 'edit'>('list')
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

  // Delete lead states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // --- Inline EDIT lead states ---
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [leadHistory, setLeadHistory] = useState<LeadHistory[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Edit Lead Form states
  const [communicationOption, setCommunicationOption] = useState<'Call' | 'Message'>('Call')
  const [callDuration, setCallDuration] = useState('')
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

  // Handle staff assignment inline update
  const handleAssignStaff = async (leadId: string, staffName: string) => {
    try {
      const res = await fetch(`/api/admin/crm/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: staffName })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Assigned lead to ${staffName || 'None'}`)
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assigned_to: staffName } : l))
      } else {
        toast.error(data.error || 'Failed to assign staff')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  // Switch to Edit View
  const handleStartEdit = async (lead: Lead) => {
    setView('edit')
    setEditingLead(lead)
    setLoadingDetails(true)
    
    // Set form defaults
    setCommunicationOption('Call')
    setCallDuration('')
    setRemarks('')
    setFollowUpDate('')
    setEditStatus(lead.status)

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

  const handleCancelEdit = () => {
    setView('list')
    setEditingLead(null)
    setLeadHistory([])
  }

  // Submit follow-up event
  const handleUpdateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLead) return
    if (!remarks.trim()) {
      toast.error('Remarks are required')
      return
    }
    if (!followUpDate) {
      toast.error('Follow Up Date is required')
      return
    }
    if (!editStatus) {
      toast.error('Status is required')
      return
    }

    setSubmittingUpdate(true)
    try {
      const res = await fetch(`/api/admin/crm/leads/${editingLead.id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communication_option: communicationOption,
          call_duration: communicationOption === 'Call' ? callDuration : '',
          remarks: remarks.trim(),
          follow_up_date: followUpDate,
          status: editStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Lead updated and logged successfully!')
        
        // Refresh details & history
        const detailRes = await fetch(`/api/admin/crm/leads/${editingLead.id}`)
        const detailData = await detailRes.json()
        if (detailData.success) {
          setEditingLead(detailData.data)
          setLeadHistory(detailData.data.history || [])
        }

        // Reset form
        setRemarks('')
        setCallDuration('')
        setFollowUpDate('')
      } else {
        toast.error(data.error || 'Failed to submit update')
      }
    } catch {
      toast.error('Something went wrong submitting follow-up')
    } finally {
      setSubmittingUpdate(false)
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

  const formatDateOnly = (dateStr: string | null) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // Helper to draw status badge with colors
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
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Title Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">
              {view === 'edit' ? 'Edit Lead' : 'All Leads'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {view === 'edit' ? 'Update follow up timeline and lead logs' : 'Monitor sales pipelines, leads logs, and assignments'}
            </p>
          </div>
        </div>

        {view === 'edit' && editingLead ? (
          /* Inline EDIT Lead Details View */
          <div className="flex flex-col gap-6">
            
            {/* Card 1: Lead Details (Read-only inputs) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-700/50 pb-2">
                Lead Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Lead Source</label>
                  <input
                    type="text"
                    value={editingLead.lead_source}
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">School Name</label>
                  <input
                    type="text"
                    value={editingLead.school_name}
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Contact Person</label>
                  <input
                    type="text"
                    value={editingLead.contact_person || '—'}
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mobile No.</label>
                  <input
                    type="text"
                    value={editingLead.mobile_no}
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Id</label>
                  <input
                    type="text"
                    value={editingLead.email_id || '—'}
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">State</label>
                  <input
                    type="text"
                    value={editingLead.state || '—'}
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">District</label>
                  <input
                    type="text"
                    value={editingLead.district || '—'}
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">No. of Students</label>
                  <input
                    type="text"
                    value={editingLead.no_of_students || 0}
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Update Lead (Form) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-700/50 pb-2">
                Update Lead
              </h3>
              <form onSubmit={handleUpdateFollowUp} className="flex flex-col gap-5">
                {/* Communication Option Radio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                    Communication Option<span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-6 mt-1.5">
                    {(['Call', 'Message'] as const).map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm text-slate-750 dark:text-slate-300 font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="comm_option"
                          value={opt}
                          checked={communicationOption === opt}
                          onChange={() => setCommunicationOption(opt)}
                          className="text-[#0E9485] focus:ring-[#0E9485] w-4 h-4"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditional Call Duration Input */}
                {communicationOption === 'Call' && (
                  <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Call Duration</label>
                    <input
                      type="text"
                      placeholder="Enter Call Duration (e.g. 5 min)"
                      value={callDuration}
                      onChange={(e) => setCallDuration(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                )}

                {/* Remarks */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                    Remarks<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>

                {/* Follow Up Date & Status Dropdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                      Follow Up Date<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                      Status<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                      required
                    >
                      <option value="">Select Status</option>
                      {statuses.map(st => (
                        <option key={st.id} value={st.name}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-755 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingUpdate}
                    className="px-10 py-2.5 bg-[#0F9E8F] hover:bg-[#0D8E80] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-500/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submittingUpdate && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update
                  </button>
                </div>
              </form>
            </div>

            {/* Card 3: Lead History (Timeline table) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-700/50 pb-2">
                Lead History
              </h3>
              
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-16">S. No.</th>
                      <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">School Name</th>
                      <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Address</th>
                      <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Mobile No.</th>
                      <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Lead Source</th>
                      <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Remarks</th>
                      <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                      <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Updated At</th>
                      <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {loadingDetails ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-[#0E9485]" />
                            Loading lead logs...
                          </div>
                        </td>
                      </tr>
                    ) : leadHistory.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                          No history timeline entries.
                        </td>
                      </tr>
                    ) : (
                      leadHistory.map((hist, idx) => {
                        const { date: cDate, time: cTime } = formatDateTime(hist.created_at)
                        const { date: fDate, time: fTime } = formatDateTime(editingLead.updated_at)
                        return (
                          <tr key={hist.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-5 py-4 font-medium text-slate-550 dark:text-slate-400">{idx + 1}.</td>
                            <td className="px-5 py-4 text-slate-800 dark:text-slate-100 font-semibold">{editingLead.school_name}</td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-sm">
                              {editingLead.district ? `${editingLead.district}, ` : ''}{editingLead.state}
                            </td>
                            <td className="px-5 py-4 text-slate-650 dark:text-slate-300 text-sm font-semibold">{editingLead.mobile_no}</td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold">{editingLead.lead_source}</td>
                            <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs break-words font-medium">
                              {hist.remarks || '—'}
                              {hist.communication_option === 'Call' && hist.call_duration ? (
                                <span className="block text-[10px] text-teal-600 font-bold mt-0.5">
                                  Duration: {hist.call_duration}
                                </span>
                              ) : null}
                            </td>
                            <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                {cDate}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                {cTime}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                {fDate}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                {fTime}
                              </div>
                            </td>
                            <td className="px-5 py-4">
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
        ) : (
          /* List Leads Log View */
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
            
            {/* Filter controls row */}
            <div className="flex items-center justify-between flex-wrap gap-5">
              <div className="flex items-center flex-wrap gap-4 flex-1">
                {/* Lead Source Filter */}
                <div className="flex flex-col gap-1 shrink-0 w-44">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead Source</label>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="">Select an Option</option>
                    {SOURCE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1 shrink-0 w-44">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="">Select an Option</option>
                    {statuses.map(st => (
                      <option key={st.id} value={st.name}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Bar & Export button */}
              <div className="flex items-center gap-3">
                <form onSubmit={handleSearchSubmit} className="relative w-72">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by School Name, Address, Mb no."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </form>
                
                {/* Export button */}
                <button
                  onClick={() => toast.success('Exporting leads data...')}
                  className="p-2.5 bg-[#0E9485] hover:bg-[#0D8E80] text-white rounded-xl transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                  title="Export Leads Log"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Leads Log Table */}
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-16">S. No.</th>
                    <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-44">Assigned To</th>
                    <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">School Name</th>
                    <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Address</th>
                    <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Mobile No.</th>
                    <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Lead Source</th>
                    <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 max-w-xs">Remarks</th>
                    <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                    <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Updated At</th>
                    <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-[#0E9485]" />
                          Loading leads log...
                        </div>
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No leads found matching filters.
                      </td>
                    </tr>
                  ) : (
                    leads.map((l, idx) => {
                      const sNo = (currentPage - 1) * pageSize + idx + 1
                      const { date: cDate, time: cTime } = formatDateTime(l.created_at)
                      const { date: uDate, time: uTime } = formatDateTime(l.updated_at)
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-5 py-4 font-medium text-slate-550 dark:text-slate-400">{sNo}.</td>
                          <td className="px-5 py-4">
                            <select
                              value={l.assigned_to || ''}
                              onChange={(e) => handleAssignStaff(l.id, e.target.value)}
                              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-750 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                            >
                              <option value="">Assign Staff</option>
                              {STAFF_LIST.map(staff => (
                                <option key={staff} value={staff}>{staff}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-4 text-slate-800 dark:text-slate-100 font-semibold">{l.school_name}</td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold leading-normal">
                            {l.district ? `${l.district}, ` : ''}{l.state}
                          </td>
                          <td className="px-5 py-4 text-slate-650 dark:text-slate-300 text-sm font-semibold">{l.mobile_no}</td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold">{l.lead_source}</td>
                          <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium max-w-xs truncate leading-normal" title={l.latest_remarks}>
                            {l.latest_remarks || '—'}
                          </td>
                          <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              {cDate}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              {cTime}
                            </div>
                          </td>
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
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleStartEdit(l)}
                                className="w-7 h-7 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                                title="Edit/Update Lead"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(l.id)}
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
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-305 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {'<<'}
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchLeads(currentPage - 1, searchText, filterSource, filterStatus)}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-305 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {getPageNumbers().map((pg) => (
                    <button
                      key={pg}
                      onClick={() => fetchLeads(pg, searchText, filterSource, filterStatus)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        pg === currentPage
                          ? 'bg-[#0E9485] text-white shadow-sm'
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-700'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchLeads(currentPage + 1, searchText, filterSource, filterStatus)}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-305 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchLeads(totalPages, searchText, filterSource, filterStatus)}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-355 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {'>>'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Lead confirmation */}
      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete CRM Lead"
        description="Are you sure you want to delete this CRM lead? This action will permanently remove all logs and history logs related to it."
      />
    </AdminLayout>
  )
}

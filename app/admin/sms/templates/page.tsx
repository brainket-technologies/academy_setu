'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Search, Loader2, Calendar, Clock, Eye, X } from 'lucide-react'
import { toast } from 'sonner'

interface TemplateRequest {
  id: string
  assigned_to: string
  school_name: string
  contact_person: string
  mobile_no: string
  email_id: string
  remarks: string
  state: string
  district: string
  status: string
  created_at: string
  updated_at: string
  history?: HistoryItem[]
}

interface HistoryItem {
  id: string
  communication_option: string
  call_duration?: string
  remarks: string
  follow_up_date?: string
  status: string
  lead_source: string
  created_at: string
  updated_at: string
}

const STAFF_LIST = ['Riya', 'Amit', 'Amit B', 'Ankit', 'Priya', 'Rahul']
const STATUS_OPTIONS = ['Pending', 'Created', 'Active']

export default function SmsTemplatesPage() {
  const [requests, setRequests] = useState<TemplateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Details Modal states
  const [selectedRequest, setSelectedRequest] = useState<TemplateRequest | null>(null)
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Follow-up inputs
  const [communicationOption, setCommunicationOption] = useState<'Call' | 'Message'>('Call')
  const [callDuration, setCallDuration] = useState('')
  const [remarks, setRemarks] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [status, setStatus] = useState('Pending')
  const [submittingUpdate, setSubmittingUpdate] = useState(false)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/admin/sms/template-requests?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setRequests(data.data)
      } else {
        toast.error('Failed to load template requests')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching template requests')
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleAssignStaff = async (requestId: string, staffName: string) => {
    try {
      const res = await fetch(`/api/admin/sms/template-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: staffName })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Assigned request to ${staffName || 'None'}`)
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, assigned_to: staffName } : r))
      } else {
        toast.error(data.error || 'Failed to assign staff')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const handleOpenDetails = async (request: TemplateRequest) => {
    setSelectedRequest(request)
    setCommunicationOption('Call')
    setCallDuration('')
    setRemarks('')
    setFollowUpDate('')
    setStatus(request.status)
    setLoadingHistory(true)

    try {
      const res = await fetch(`/api/admin/sms/template-requests/${request.id}`)
      const data = await res.json()
      if (data.success) {
        setSelectedRequest(data.data)
        setSelectedHistory(data.data.history || [])
      }
    } catch {
      toast.error('Failed to load history details')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleUpdateTimeline = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return
    if (!remarks.trim()) return toast.error('Remarks are required')

    setSubmittingUpdate(true)
    try {
      const res = await fetch(`/api/admin/sms/template-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communication_option: communicationOption,
          call_duration: communicationOption === 'Call' ? callDuration : '',
          remarks: remarks.trim(),
          follow_up_date: followUpDate || null,
          status
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Template Request updated and timeline logged!')
        
        // Refresh details modal
        const detailRes = await fetch(`/api/admin/sms/template-requests/${selectedRequest.id}`)
        const detailData = await detailRes.json()
        if (detailData.success) {
          setSelectedRequest(detailData.data)
          setSelectedHistory(detailData.data.history || [])
        }

        // Reset inputs
        setRemarks('')
        setCallDuration('')
        setFollowUpDate('')
        
        // Refresh listing
        fetchRequests()
      } else {
        toast.error(data.error || 'Failed to submit update')
      }
    } catch {
      toast.error('An error occurred during submission')
    } finally {
      setSubmittingUpdate(false)
    }
  }

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      return `${date} ${time}`
    } catch {
      return dateStr
    }
  }

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">Template Request</h1>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
        
        {/* Search header inside table panel */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-slate-755 dark:text-slate-350">
            SMS Template Request List
          </span>
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search request school or person..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-350"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-5 text-center w-16">S.No.</th>
                <th className="py-4 px-5 w-44">Assigned To</th>
                <th className="py-4 px-5">School Name</th>
                <th className="py-4 px-5">Name</th>
                <th className="py-4 px-5">Mobile No.</th>
                <th className="py-4 px-5">Email</th>
                <th className="py-4 px-5 max-w-xs">Remarks</th>
                <th className="py-4 px-5">Created At</th>
                <th className="py-4 px-5">Updated At</th>
                <th className="py-4 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-sm text-slate-755 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No template requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req, idx) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                    <td className="py-4 px-5 text-center text-slate-400 font-semibold">
                      {idx + 1}.
                    </td>
                    <td className="py-4 px-5">
                      <select
                        value={req.assigned_to || ''}
                        onChange={e => handleAssignStaff(req.id, e.target.value)}
                        className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                      >
                        <option value="">Assign Staff</option>
                        {STAFF_LIST.map(staff => (
                          <option key={staff} value={staff}>{staff}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-850 dark:text-slate-200">
                      {req.school_name}
                    </td>
                    <td className="py-4 px-5 text-slate-700 dark:text-slate-300 font-semibold">
                      {req.contact_person}
                    </td>
                    <td className="py-4 px-5 text-slate-650 dark:text-slate-300 font-semibold">
                      {req.mobile_no}
                    </td>
                    <td className="py-4 px-5 font-medium">
                      {req.email_id}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs" title={req.remarks}>
                      {req.remarks || '—'}
                    </td>
                    <td className="py-4 px-5 text-xs font-medium text-slate-500 dark:text-slate-450 whitespace-nowrap">
                      {formatDateTime(req.created_at)}
                    </td>
                    <td className="py-4 px-5 text-xs font-medium text-slate-500 dark:text-slate-450 whitespace-nowrap">
                      {formatDateTime(req.updated_at)}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleOpenDetails(req)}
                          className="p-1.5 rounded-lg bg-teal-55 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors cursor-pointer"
                          title="View Request & Log Updates"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/10">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
            </div>
          ) : requests.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No template requests found.
            </div>
          ) : (
            requests.map((req, idx) => (
              <div 
                key={req.id} 
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{idx + 1} Template Request</span>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-0.5">{req.school_name}</h4>
                  </div>
                  <button
                    onClick={() => handleOpenDetails(req)}
                    className="p-2 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-xl cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Person</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{req.contact_person}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Mobile</span>
                    <span>{req.mobile_no}</span>
                  </div>
                  <div className="mt-1 col-span-2">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email</span>
                    <span className="block truncate">{req.email_id}</span>
                  </div>
                  <div className="mt-1 col-span-2">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Remarks</span>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{req.remarks || '—'}</p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assign Staff:</span>
                  <select
                    value={req.assigned_to || ''}
                    onChange={e => handleAssignStaff(req.id, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="">Assign Staff</option>
                    {STAFF_LIST.map(staff => (
                      <option key={staff} value={staff}>{staff}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Template Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedRequest(null)}
          />

          <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                Template Request
              </h2>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-slate-55 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Details Section (Read-only inputs) */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-105 dark:border-slate-750 pb-2">
                  Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">School Name</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.school_name}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Contact Person</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.contact_person}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Mobile No.</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.mobile_no}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Email Id</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.email_id}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">State</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.state || 'Uttar Pradesh'}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">District</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.district || 'Lucknow'}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Update Request Form */}
              <form onSubmit={handleUpdateTimeline} className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65 space-y-4">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider border-b border-slate-105 dark:border-slate-750 pb-2">
                  Update Request
                </h3>
                
                <div className="flex items-center gap-6">
                  <span className="text-xs font-bold text-slate-655 dark:text-slate-400">Communication Option</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-350 font-bold cursor-pointer">
                      <input
                        type="radio"
                        checked={communicationOption === 'Call'}
                        onChange={() => setCommunicationOption('Call')}
                        className="w-4 h-4 text-teal-650 focus:ring-teal-500"
                      />
                      Call
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-350 font-bold cursor-pointer">
                      <input
                        type="radio"
                        checked={communicationOption === 'Message'}
                        onChange={() => setCommunicationOption('Message')}
                        className="w-4 h-4 text-teal-650 focus:ring-teal-500"
                      />
                      Message
                    </label>
                  </div>
                </div>

                {communicationOption === 'Call' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                      Call Duration
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Call Duration"
                      value={callDuration}
                      onChange={e => setCallDuration(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:text-slate-200"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Remarks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter School Name"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:text-slate-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                      Follow Up Date
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={e => setFollowUpDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:text-slate-200 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:text-slate-200 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-750 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingUpdate}
                    className="px-5 py-2.5 bg-teal-650 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-600/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingUpdate && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update
                  </button>
                </div>
              </form>

              {/* Request History log */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65 space-y-4">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider border-b border-slate-105 dark:border-slate-750 pb-2">
                  Request History
                </h3>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-12">S.No.</th>
                        <th className="py-3 px-4">School Name</th>
                        <th className="py-3 px-4">Address</th>
                        <th className="py-3 px-4">Mobile No.</th>
                        <th className="py-3 px-4">Lead Source</th>
                        <th className="py-3 px-4">Remarks</th>
                        <th className="py-3 px-4">Created At</th>
                        <th className="py-3 px-4">Updated At</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-slate-700 dark:text-slate-300 font-medium">
                      {loadingHistory ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-teal-650" />
                          </td>
                        </tr>
                      ) : selectedHistory.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-550">
                            No request history logged.
                          </td>
                        </tr>
                      ) : (
                        selectedHistory.map((hist, idx) => (
                          <tr key={hist.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-750/30">
                            <td className="py-3 px-4 text-center text-slate-400">{idx + 1}.</td>
                            <td className="py-3 px-4 font-semibold text-slate-850 dark:text-slate-200">
                              {selectedRequest.school_name}
                            </td>
                            <td className="py-3 px-4">
                              {selectedRequest.district ? `${selectedRequest.district}, ` : ''}{selectedRequest.state}
                            </td>
                            <td className="py-3 px-4 font-semibold">{selectedRequest.mobile_no}</td>
                            <td className="py-3 px-4 font-bold text-slate-600 dark:text-slate-400">{hist.lead_source || 'Offline Meeting'}</td>
                            <td className="py-3 px-4 leading-normal whitespace-pre-wrap max-w-xs">{hist.remarks}</td>
                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDateTime(hist.created_at)}</td>
                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDateTime(hist.updated_at || selectedRequest.updated_at)}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-550 border border-amber-250 uppercase tracking-wider">
                                ● {hist.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

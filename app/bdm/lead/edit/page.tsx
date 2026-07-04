'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { BdmLayout } from '@/components/layout/BdmLayout'
import { Download, Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

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
  history?: any[]
}

interface LeadStatus {
  id: string
  name: string
  text_color: string
  bg_color: string
}

function EditLeadContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = searchParams.get('id')

  const [lead, setLead] = useState<Lead | null>(null)
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Update Form State
  const [communicationOption, setCommunicationOption] = useState<'Call' | 'Message'>('Call')
  const [callDuration, setCallDuration] = useState('')
  const [remarks, setRemarks] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [editStatus, setEditStatus] = useState('')

  useEffect(() => {
    if (!leadId) {
      toast.error('No lead ID provided')
      router.push('/bdm/lead')
      return
    }

    const fetchData = async () => {
      try {
        const [leadRes, statusRes] = await Promise.all([
          fetch(`/api/admin/crm/leads/${leadId}`),
          fetch('/api/admin/crm/status')
        ])
        
        const leadData = await leadRes.json()
        const statusData = await statusRes.json()

        if (leadData.success && leadData.data) {
          setLead(leadData.data)
          setEditStatus(leadData.data.status || '')
        } else {
          toast.error('Lead not found')
          router.push('/bdm/lead')
        }

        if (statusData.success) {
          setStatuses(statusData.data)
        }
      } catch {
        toast.error('Error fetching lead details')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [leadId, router])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lead) return
    if (!remarks.trim() || !followUpDate || !editStatus) {
      toast.error('Please fill required fields (Remarks, Follow Up Date, Status)')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/crm/leads/${lead.id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communication_option: communicationOption,
          call_duration: callDuration,
          remarks: remarks.trim(),
          follow_up_date: followUpDate,
          status: editStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Lead updated successfully!')
        
        // Refresh details
        const detailRes = await fetch(`/api/admin/crm/leads/${lead.id}`)
        const detailData = await detailRes.json()
        if (detailData.success) {
          setLead(detailData.data)
        }

        // Reset fields
        setRemarks('')
        setCallDuration('')
        setFollowUpDate('')
      } else {
        toast.error(data.error || 'Failed to submit update')
      }
    } catch {
      toast.error('Something went wrong submitting update')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-medium tracking-wide">Loading Lead Details...</p>
      </div>
    )
  }

  if (!lead) return null

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Lead</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[28px] p-6 lg:p-10 shadow-sm border border-slate-100 dark:border-slate-700/50">
        
        {/* Top Action Buttons */}
        <div className="flex justify-end gap-3 mb-10">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-lg hover:bg-indigo-100 transition-colors">
            Quotation Created
            <Download className="w-4 h-4" />
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            Create Quotation
          </button>
        </div>

        {/* Lead Details */}
        <div className="mb-12 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-200 dark:bg-slate-700 mt-3" />
          <div className="relative inline-block bg-white dark:bg-slate-800 pr-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Lead Details
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Application Filled</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Lead Source</label>
              <input type="text" readOnly value={lead.lead_source || ''} className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">School Name</label>
              <input type="text" readOnly value={lead.school_name || ''} className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Contact Person</label>
              <input type="text" readOnly value={lead.contact_person || ''} className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mobile No.</label>
              <input type="text" readOnly value={lead.mobile_no || ''} className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Id</label>
              <input type="text" readOnly value={lead.email_id || ''} className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">State</label>
              <input type="text" readOnly value={lead.state || ''} className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">District</label>
              <input type="text" readOnly value={lead.district || ''} className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">No. of Students</label>
              <input type="text" readOnly value={lead.no_of_students || ''} className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Update Lead */}
        <div className="mb-12 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-200 dark:bg-slate-700 mt-3" />
          <div className="relative inline-block bg-white dark:bg-slate-800 pr-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Update Lead</h2>
          </div>

          <form onSubmit={handleUpdate} className="mt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Communication Option */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Communication Option</label>
                <div className="flex items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="comm" 
                        className="peer sr-only" 
                        checked={communicationOption === 'Call'} 
                        onChange={() => setCommunicationOption('Call')} 
                      />
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-indigo-500 transition-colors" />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-indigo-500 scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Call</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="comm" 
                        className="peer sr-only" 
                        checked={communicationOption === 'Message'} 
                        onChange={() => setCommunicationOption('Message')} 
                      />
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-indigo-500 transition-colors" />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-indigo-500 scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Message</span>
                  </label>
                </div>
              </div>

              {/* Call Duration (Optional based on design) */}
              {communicationOption === 'Call' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Call Duration</label>
                  <input 
                    type="text" 
                    placeholder="Enter Call Duration (e.g. 5m 30s)" 
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Remarks</label>
              <input 
                type="text" 
                placeholder="Enter Remarks" 
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Follow Up Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
                  <input 
                    type="date" 
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Status</option>
                  {statuses.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Link href="/bdm/lead" className="px-8 py-2.5 bg-white border-2 border-indigo-500 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={submitting}
                className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Update
              </button>
            </div>
          </form>
        </div>

        {/* Lead History Table */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-200 dark:bg-slate-700 mt-3" />
          <div className="relative inline-block bg-white dark:bg-slate-800 pr-4 mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Lead History</h2>
          </div>

          <div className="border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/60">
                  <tr>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">S. No.</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">School Name</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Address</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Mobile No.</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Lead Source</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Remarks</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Created At</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Updated At</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {!lead.history || lead.history.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-slate-500 font-medium">
                        No history logs found.
                      </td>
                    </tr>
                  ) : (
                    lead.history.map((log: any, index: number) => {
                      const statObj = statuses.find(s => s.name === log.status)
                      return (
                        <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-slate-500">{index + 1}.</td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{lead.school_name || '-'}</td>
                          <td className="px-5 py-3.5 text-slate-500 text-sm">{[lead.district, lead.state].filter(Boolean).join(', ') || '-'}</td>
                          <td className="px-5 py-3.5 font-medium text-slate-600">{lead.mobile_no}</td>
                          <td className="px-5 py-3.5 text-slate-600">{lead.lead_source || '-'}</td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-normal min-w-[200px]">
                            {log.remarks || '-'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span>{new Date(log.created_at).toLocaleDateString('en-GB')}</span>
                              <span className="text-[10px]">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span>{new Date(log.created_at).toLocaleDateString('en-GB')}</span>
                              <span className="text-[10px]">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {statObj ? (
                              <span 
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold"
                                style={{ backgroundColor: statObj.bg_color, color: statObj.text_color }}
                              >
                                <span className="w-1 h-1 rounded-full bg-current opacity-75" />
                                {statObj.name}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">{log.status || 'None'}</span>
                            )}
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
  )
}

export default function BdmEditLeadPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    }>
      <EditLeadContent />
    </Suspense>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { BdmLayout } from '@/components/layout/BdmLayout'
import { Search, Upload, Edit3, ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const SOURCE_OPTIONS = ['Offline Meeting', 'YouTube', 'Facebook', 'Other']
const STATE_OPTIONS = ['Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Delhi', 'Maharashtra', 'Bihar', 'Haryana']
const DISTRICT_OPTIONS = ['Lucknow', 'Bhopal', 'Chandigarh', 'New Delhi', 'Mumbai', 'Patna', 'Gurugram', 'Noida']

interface Lead {
  id: string
  contact_person: string
  school_name: string
  district: string
  state: string
  mobile_no: string
  latest_remarks?: string
  latest_follow_up?: string
  status: string
  assigned_to: string
  created_at: string
  updated_at: string
}

interface LeadStatus {
  id: string
  name: string
  text_color: string
  bg_color: string
}

export default function BdmLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [statuses, setStatuses] = useState<LeadStatus[]>([])

  // Search & Filter
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Add Lead Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.leadSource || !formData.mobileNo.trim() || !formData.schoolName.trim() || !formData.status) {
      toast.error('Please fill required fields (Source, Mobile, School, Status)')
      return
    }

    setIsSaving(true)
    const url = '/api/admin/crm/leads'
    
    try {
      const res = await fetch(url, {
        method: 'POST',
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
        fetchLeads(1, searchText, filterStatus)
      } else {
        toast.error(data.error || 'Failed to create lead')
      }
    } catch {
      toast.error('Error occurred while creating lead')
    } finally {
      setIsSaving(false)
    }
  }

  const fetchLeads = useCallback(async (page = 1, search = '', stat = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      })
      if (search) params.append('search', search)
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
    fetchLeads(1, searchText, filterStatus)
    fetchStatuses()
  }, [fetchLeads, fetchStatuses])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLeads(1, searchText, filterStatus)
  }

  return (
    <BdmLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">All Lead</h1>
          <button
            onClick={openAddModal}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  fetchLeads(1, searchText, e.target.value)
                }}
                className="w-full sm:w-[200px] bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select an Option</option>
                {statuses.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-3 w-full sm:w-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search By School Name, Address, Mb no."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                />
              </form>
              <button
                className="h-[44px] w-[44px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                title="Export"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/60">
                  <tr>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">S. No.</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Name</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">School Name</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Address</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Mobile No.</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Last Response</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Next Follow up</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px]">Status</th>
                    <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300 text-[13px] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading leads...</p>
                        </div>
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-slate-500 font-medium">
                        No leads found.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead, index) => {
                      const statObj = statuses.find(s => s.name === lead.status)
                      const sIdx = (currentPage - 1) * pageSize + index + 1
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-5 py-3.5 font-medium text-slate-500">{sIdx}.</td>
                          <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">{lead.contact_person || '-'}</td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{lead.school_name || '-'}</td>
                          <td className="px-5 py-3.5 text-slate-500 text-sm">
                            {[lead.district, lead.state].filter(Boolean).join(', ') || '-'}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-600">{lead.mobile_no}</td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-normal min-w-[200px]">
                            {lead.latest_remarks || '-'}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-600">
                            {lead.latest_follow_up ? new Date(lead.latest_follow_up).toLocaleDateString('en-GB') : '-'}
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
                              <span className="text-slate-400 font-medium">{lead.status || 'None'}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <Link
                              href={`/bdm/lead/edit?id=${lead.id}`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                              title="Edit Lead"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && leads.length > 0 && (
              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-500">
                  Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} Entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchLeads(currentPage - 1, searchText, filterStatus)}
                    className="p-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // simple sliding window for pagination
                      let start = Math.max(1, currentPage - 2)
                      if (start + 4 > totalPages) {
                        start = Math.max(1, totalPages - 4)
                      }
                      const p = start + i
                      if (p > totalPages) return null
                      return (
                        <button
                          key={p}
                          onClick={() => fetchLeads(p, searchText, filterStatus)}
                          className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                            currentPage === p 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => fetchLeads(currentPage + 1, searchText, filterStatus)}
                    className="p-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
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
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
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
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Contact Person</label>
                    <input
                      type="text"
                      placeholder="Enter Contact Person"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
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
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
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
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
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
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
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
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
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
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </BdmLayout>
  )
}

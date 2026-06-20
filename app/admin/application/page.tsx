'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Search, Plus, Eye, Edit3, RefreshCw, X, MoreVertical, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Application {
  id: string
  application_no: string
  school_name: string
  contact_person: string
  state: string
  district: string
  status: 'Applied' | 'Generate' | 'Requested' | 'Completed'
  created_at: string
}

export default function ApplicationPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Counts for tabs
  const [metaCounts, setMetaCounts] = useState({ totalCount: 0, newCount: 0 })

  // Search & Filtering
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'new'>('all')

  // Context Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false)

  // Selected Record
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  // Form States (Create & Edit)
  const [schoolName, setSchoolName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [stateName, setStateName] = useState('')
  const [districtName, setDistrictName] = useState('')
  const [appStatus, setAppStatus] = useState<Application['status']>('Applied')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const menuRef = useRef<HTMLDivElement>(null)

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (searchText) {
        queryParams.append('search', searchText)
      }
      queryParams.append('tab', activeTab)

      const response = await fetch(`/api/admin/application?${queryParams.toString()}`)
      const resData = await response.json()
      if (resData.success) {
        setApplications(resData.data)
        if (resData.meta) {
          setMetaCounts({
            totalCount: resData.meta.totalCount,
            newCount: resData.meta.newCount
          })
        }
      } else {
        toast.error('Failed to load applications')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Something went wrong loading applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [activeTab])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchApplications()
  }

  // Close context menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Create Application Action
  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schoolName.trim() || !contactPerson.trim() || !stateName.trim() || !districtName.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_name: schoolName.trim(),
          contact_person: contactPerson.trim(),
          state: stateName.trim(),
          district: districtName.trim(),
          status: appStatus
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success('Application created successfully')
        setIsCreateModalOpen(false)
        // Reset form
        setSchoolName('')
        setContactPerson('')
        setStateName('')
        setDistrictName('')
        setAppStatus('Applied')
        fetchApplications()
      } else {
        toast.error(resData.error || 'Failed to create application')
      }
    } catch (error) {
      console.error('Create error:', error)
      toast.error('Something went wrong creating application')
    } finally {
      setSubmitting(false)
    }
  }

  // Edit Application Action
  const handleEditApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return

    if (!schoolName.trim() || !contactPerson.trim() || !stateName.trim() || !districtName.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/application/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_name: schoolName.trim(),
          contact_person: contactPerson.trim(),
          state: stateName.trim(),
          district: districtName.trim(),
          status: appStatus
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success('Application updated successfully')
        setIsCreateModalOpen(false)
        setSelectedApp(null)
        fetchApplications()
      } else {
        toast.error(resData.error || 'Failed to update application')
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('Something went wrong updating application')
    } finally {
      setSubmitting(false)
    }
  }

  // Update Status Action
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/application/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: appStatus })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success('Status updated successfully')
        setIsUpdateStatusModalOpen(false)
        setSelectedApp(null)
        fetchApplications()
      } else {
        toast.error(resData.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Status error:', error)
      toast.error('Something went wrong updating status')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Action
  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      const response = await fetch(`/api/admin/application/${id}`, { method: 'DELETE' })
      const resData = await response.json()
      if (resData.success) {
        toast.success('Application deleted successfully')
        fetchApplications()
      } else {
        toast.error(resData.error || 'Failed to delete application')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Something went wrong deleting application')
    }
  }

  // Navigate to details page for View / Edit
  const goToDetailsPage = (app: Application) => {
    setActiveMenuId(null)
    router.push(`/admin/application/${app.id}`)
  }

  const openUpdateStatusModal = (app: Application) => {
    setSelectedApp(app)
    setAppStatus(app.status)
    setIsUpdateStatusModalOpen(true)
    setActiveMenuId(null)
  }

  // Status Badge visual styles
  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
      case 'Generate':
        return 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800'
      case 'Requested':
        return 'bg-pink-50 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-800'
      case 'Completed':
        return 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700'
    }
  }

  // Pagination calculation
  const totalEntries = applications.length
  const totalPages = Math.ceil(totalEntries / pageSize)
  const paginatedApps = applications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      return { date, time }
    } catch {
      return { date: dateStr, time: '' }
    }
  }

  const padZero = (num: number) => (num < 10 ? `0${num}` : num.toString())

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Title and Top Search/Create Row */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Application</h1>
          
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name, Mobile no."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </form>
            <Link 
              href="/admin/application/create"
              className="w-10 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-md shadow-teal-600/10 cursor-pointer transition-colors shrink-0"
              title="Add Application"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Tab Toggle Component */}
        <div className="flex gap-4">
          {/* Total Application tab */}
          <button
            onClick={() => {
              setActiveTab('all')
              setCurrentPage(1)
            }}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 shadow-sm border cursor-pointer ${
              activeTab === 'all'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
            }`}
          >
            Total Application
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-teal-500 text-white'
                : 'bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400'
            }`}>
              {padZero(metaCounts.totalCount)}
            </span>
          </button>

          {/* New Application tab */}
          <button
            onClick={() => {
              setActiveTab('new')
              setCurrentPage(1)
            }}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 shadow-sm border cursor-pointer ${
              activeTab === 'new'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
            }`}
          >
            New Application
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-colors ${
              activeTab === 'new'
                ? 'bg-teal-500 text-white'
                : 'bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400'
            }`}>
              {padZero(metaCounts.newCount)}
            </span>
          </button>
        </div>

        {/* Table Container Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col relative">
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Application No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">School Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Contact Person</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">State</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">District</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Status</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                        Loading applications...
                      </div>
                    </td>
                  </tr>
                ) : paginatedApps.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map((app, index) => {
                    const sNo = (currentPage - 1) * pageSize + index + 1
                    const { date, time } = formatDate(app.created_at)
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                        <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-200 text-xs tracking-wider">{app.application_no}</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-200 font-medium">{app.school_name}</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{app.contact_person}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">{app.state}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">{app.district}</td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                          📅 {date}<br/>🕒 {time}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              app.status === 'Applied' ? 'bg-blue-500' :
                              app.status === 'Generate' ? 'bg-amber-500' :
                              app.status === 'Requested' ? 'bg-pink-500' :
                              'bg-emerald-500'
                            }`} />
                            {app.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuId(activeMenuId === app.id ? null : app.id)
                            }}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {/* Context Action Menu Dropdown */}
                          {activeMenuId === app.id && (
                            <div 
                              ref={menuRef}
                              className="absolute right-12 top-2 bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600/80 rounded-xl shadow-2xl z-30 w-44 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 text-left"
                            >
                              <button
                                onClick={() => openUpdateStatusModal(app)}
                                className="w-full px-4 py-2.5 hover:bg-[#f0f9ff] dark:hover:bg-slate-600 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <RefreshCw className="w-4 h-4 shrink-0 text-amber-500" />
                                Update Status
                              </button>
                              <button
                                onClick={() => goToDetailsPage(app)}
                                className="w-full px-4 py-2.5 hover:bg-[#f0f9ff] dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4 shrink-0 text-blue-500" />
                                View Details
                              </button>
                              <button
                                onClick={() => goToDetailsPage(app)}
                                className="w-full px-4 py-2.5 hover:bg-[#f0f9ff] dark:hover:bg-slate-600 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4 shrink-0 text-emerald-500" />
                                Edit Details
                              </button>
                              <hr className="border-slate-100 dark:border-slate-600 my-1" />
                              <button
                                onClick={() => {
                                  setActiveMenuId(null)
                                  handleDeleteApplication(app.id)
                                }}
                                className="w-full px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4 shrink-0 text-red-500" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalEntries > 0 && (
            <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalEntries)} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} Entries
              </p>
              
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &lt;&lt;
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &lt;
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pgNum = idx + 1
                  const isCurrent = pgNum === currentPage
                  return (
                    <button
                      key={pgNum}
                      onClick={() => setCurrentPage(pgNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isCurrent 
                          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25' 
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-700'
                      }`}
                    >
                      {pgNum}
                    </button>
                  )
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &gt;
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Create Application */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 border border-slate-100 dark:border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">New Application</h3>
            <form onSubmit={handleCreateApplication} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">School Name</label>
                <input
                  type="text"
                  placeholder="Enter School Name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Contact Person</label>
                <input
                  type="text"
                  placeholder="Enter Contact Person"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    placeholder="Enter State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">District</label>
                  <input
                    type="text"
                    placeholder="Enter District"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</label>
                <select
                  value={appStatus}
                  onChange={(e) => setAppStatus(e.target.value as Application['status'])}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                >
                  <option value="Applied">Applied</option>
                  <option value="Generate">Generate</option>
                  <option value="Requested">Requested</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-600/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Application
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Modal 3: Update Status */}
      {isUpdateStatusModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 border border-slate-100 dark:border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setIsUpdateStatusModalOpen(false)
                setSelectedApp(null)
              }}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500 animate-spin-slow" />
              Update Status
            </h3>
            <form onSubmit={handleUpdateStatus} className="flex flex-col gap-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Changing status for application <strong className="text-slate-700 dark:text-slate-200">{selectedApp.application_no}</strong> ({selectedApp.school_name})
              </p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Select New Status</label>
                <select
                  value={appStatus}
                  onChange={(e) => setAppStatus(e.target.value as Application['status'])}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                >
                  <option value="Applied">Applied</option>
                  <option value="Generate">Generate</option>
                  <option value="Requested">Requested</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-600/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Status
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateStatusModalOpen(false)
                    setSelectedApp(null)
                  }}
                  className="flex-1 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </AdminLayout>
  )
}
